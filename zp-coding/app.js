/* ZP-Coding board: render the runs embedded by build.py. No dependencies. */
(function (global) {
  "use strict";

  const EFFORT_ORDER = ["none", "minimal", "low", "medium", "high", "xhigh", "max"];
  const FILTER_KEYS = ["q", "lab", "provider", "harness", "effort", "status"];
  const SORTS = ["model", "provider", "harness", "agents", "effort", "status", "output", "time", "cost", "newest", "lab", "config", "runs", "models", "providers"];
  const VIEWS = ["runs", "agents", "matrix", "models", "providers"];
  const LAB_COLORS = {
    Anthropic: "#c15f3c",
    OpenAI: "#0f7b5f",
    Google: "#2a6fdb",
    DeepSeek: "#4b5bd6",
    Meta: "#1877f2",
    xAI: "#2b2b2b",
    "Moonshot AI": "#7b4dff",
    Alibaba: "#e85d04",
    "Z.ai": "#0e8a7d",
    MiniMax: "#d94f8a",
    Xiaomi: "#ff6900",
    Meituan: "#c49a00",
    Tencent: "#1a73e8",
    StepFun: "#5b5bd6",
    "Reflection AI": "#8a6d3b",
    Other: "#8a8d84",
  };
  const PROVIDER_COLORS = {
    "4router.net-cheapclaude": "#6b7280",
    "claude-max5x": "#c15f3c",
    cursor: "#141414",
    "deepseek-api": "#4b5bd6",
    "openai-plus": "#0f7b5f",
    "opencode-go": "#6d4df6",
    "rightapi.ai": "#2a6fdb",
    "xmapi.site": "#8a6d3b",
    "zlab(anycoding)": "#0e8a7d",
    "zlab(fengchao-api.com)": "#d94f8a",
  };
  const PROVIDER_MARKS = {
    "4router.net-cheapclaude": "4R",
    "claude-max5x": "CM",
    cursor: "CU",
    "deepseek-api": "DA",
    "openai-plus": "OP",
    "opencode-go": "OG",
    "rightapi.ai": "RA",
    "xmapi.site": "XM",
    "zlab(anycoding)": "ZA",
    "zlab(fengchao-api.com)": "ZF",
  };
  const PROVIDER_PALETTE = ["#6d4df6", "#0f7b5f", "#2a6fdb", "#c15f3c", "#8a6d3b", "#0e8a7d", "#d94f8a", "#6b7280"];
  const AGENT_COLORS = {
    "claude-code": "#c15f3c",
    codex: "#0f7b5f",
    cursor: "#141414",
    dsh: "#8a6d3b",
    opencode: "#6d4df6",
    pi: "#2a6fdb",
  };
  const AGENT_MARKS = {
    "claude-code": "CC",
    codex: "CX",
    cursor: "CU",
    dsh: "DS",
    opencode: "OC",
    pi: "PI",
  };

  const numberFmt = new Intl.NumberFormat("en-US");
  const compactFmt = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

  function formatNumber(value) {
    return value === null || value === undefined ? "—" : numberFmt.format(value);
  }

  function formatCompact(value) {
    return value === null || value === undefined ? "—" : compactFmt.format(value);
  }

  function formatCost(value) {
    if (value === null || value === undefined) return "—";
    if (value === 0) return "$0";
    if (value < 0.01) return "<$0.01";
    if (value < 1) return "$" + value.toFixed(3);
    return "$" + value.toFixed(2);
  }

  function formatDuration(value) {
    if (value === null || value === undefined) return "—";
    const seconds = Math.round(value);
    if (seconds < 60) return seconds + "s";
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    if (minutes < 60) return minutes + "m " + String(rest).padStart(2, "0") + "s";
    const hours = Math.floor(minutes / 60);
    return hours + "h " + String(minutes % 60).padStart(2, "0") + "m";
  }

  function effortRank(effort) {
    const index = EFFORT_ORDER.indexOf(String(effort || "").toLowerCase());
    return index === -1 ? -1 : index;
  }

  function labColor(lab) {
    return LAB_COLORS[lab] || LAB_COLORS.Other;
  }

  function providerColor(provider) {
    if (PROVIDER_COLORS[provider]) return PROVIDER_COLORS[provider];
    let hash = 0;
    for (const char of String(provider || "")) hash = (hash * 31 + char.charCodeAt(0)) | 0;
    return PROVIDER_PALETTE[Math.abs(hash) % PROVIDER_PALETTE.length];
  }

  function providerMark(provider) {
    if (PROVIDER_MARKS[provider]) return PROVIDER_MARKS[provider];
    const words = String(provider || "?").split(/[^a-z0-9]+/i).filter(Boolean);
    if (!words.length) return "?";
    return (words[0][0] + (words[1] ? words[1][0] : words[0][1] || "")).toUpperCase();
  }

  function agentColor(agent) {
    if (AGENT_COLORS[agent]) return AGENT_COLORS[agent];
    let hash = 0;
    for (const char of String(agent || "")) hash = (hash * 31 + char.charCodeAt(0)) | 0;
    return PROVIDER_PALETTE[Math.abs(hash) % PROVIDER_PALETTE.length];
  }

  function agentMark(agent) {
    if (AGENT_MARKS[agent]) return AGENT_MARKS[agent];
    const words = String(agent || "?").split(/[^a-z0-9]+/i).filter(Boolean);
    if (!words.length) return "?";
    return (words[0][0] + (words[1] ? words[1][0] : words[0][1] || "")).toUpperCase();
  }

  function colorFor(run) {
    return state.colorBy === "agent" ? agentColor(run.harness) : labColor(run.lab);
  }

  function initials(model) {
    const words = String(model || "?").split(/[^a-z0-9]+/i).filter(Boolean);
    if (!words.length) return "?";
    return (words[0][0] + (words[1] ? words[1][0] : words[0][1] || "")).toUpperCase();
  }

  function statusOf(run) {
    if (!run || !run.run) return { kind: "submitted", label: "submitted", tone: "submitted", measured: false };
    const status = run.run.status;
    if (status === "ok") return { kind: "ok", label: "measured", tone: "measured", measured: true };
    if (status === "reply") return { kind: "reply", label: "in chat", tone: "reply", measured: true };
    if (status === "no-file") return { kind: "no-file", label: "no file", tone: "failed", measured: true };
    return { kind: status || "error", label: status || "error", tone: "failed", measured: true };
  }

  function statusRank(run) {
    const status = statusOf(run);
    if (status.kind === "ok" || status.kind === "reply") return 3;
    if (status.kind === "no-file") return 2;
    if (status.measured) return 1;
    return 0;
  }

  function metricsOf(run) {
    if (!run || !run.run) return [];
    const measured = run.run;
    return [
      {
        key: "output",
        label: "Output",
        value: formatCompact(measured.output_tokens),
        note: measured.reasoning_tokens
          ? (measured.reasoning_tokens >= measured.output_tokens
            ? "all reasoning"
            : "incl. " + formatCompact(measured.reasoning_tokens))
          : "",
      },
      { key: "input", label: "Input", value: formatCompact(measured.input_tokens) },
      { key: "time", label: "Time", value: formatDuration(measured.duration_s) },
      { key: "cost", label: "List cost", value: formatCost(measured.cost_usd) },
    ];
  }

  function filterRuns(runs, filters) {
    const query = String((filters && filters.q) || "").trim().toLowerCase();
    return (runs || []).filter((run) => {
      if (!run) return false;
      if (filters.lab && run.lab !== filters.lab) return false;
      if (filters.provider && run.provider !== filters.provider) return false;
      if (filters.harness && run.harness !== filters.harness) return false;
      if (filters.effort && run.effort !== filters.effort) return false;
      if (filters.status === "measured" && !run.run) return false;
      if (filters.status === "submitted" && run.run) return false;
      if (query) {
        const haystack = [
          run.id, run.task, run.model, run.lab, run.effort, run.provider,
          run.harness, run.run && run.run.model_name,
        ].join(" ").toLowerCase();
        const terms = query.split(/\s+/).filter(Boolean);
        if (!terms.every((term) => haystack.includes(term))) return false;
      }
      return true;
    });
  }

  function sortRuns(runs, sort) {
    const copy = (runs || []).slice();
    const byModel = (a, b) =>
      a.model.localeCompare(b.model, "en", { sensitivity: "base" }) ||
      effortRank(b.effort) - effortRank(a.effort) ||
      a.provider.localeCompare(b.provider, "en", { sensitivity: "base" }) ||
      a.harness.localeCompare(b.harness, "en", { sensitivity: "base" }) ||
      a.id.localeCompare(b.id);
    if (sort === "provider") copy.sort((a, b) =>
      a.provider.localeCompare(b.provider, "en", { sensitivity: "base" }) || byModel(a, b));
    else if (sort === "harness") copy.sort((a, b) =>
      a.harness.localeCompare(b.harness, "en", { sensitivity: "base" }) || byModel(a, b));
    else if (sort === "lab") copy.sort((a, b) =>
      a.lab.localeCompare(b.lab, "en", { sensitivity: "base" }) || byModel(a, b));
    else if (sort === "effort") copy.sort((a, b) =>
      effortRank(b.effort) - effortRank(a.effort) || byModel(a, b));
    else if (sort === "status") copy.sort((a, b) =>
      statusRank(b) - statusRank(a) || byModel(a, b));
    else if (sort === "newest") copy.sort((a, b) => {
      const left = (a.run && a.run.started_at) || "";
      const right = (b.run && b.run.started_at) || "";
      return right.localeCompare(left) || byModel(a, b);
    });
    else if (sort === "output") copy.sort((a, b) => {
      const left = a.run ? a.run.output_tokens : -1;
      const right = b.run ? b.run.output_tokens : -1;
      return right - left || byModel(a, b);
    });
    else if (sort === "time") copy.sort((a, b) => {
      const left = a.run ? a.run.duration_s : -1;
      const right = b.run ? b.run.duration_s : -1;
      return right - left || byModel(a, b);
    });
    else if (sort === "cost") copy.sort((a, b) => {
      const left = a.run ? a.run.cost_usd : -1;
      const right = b.run ? b.run.cost_usd : -1;
      return right - left || byModel(a, b);
    });
    else if (sort === "model") copy.sort(byModel);
    return copy;
  }

  function median(values) {
    const clean = (values || []).filter((value) => typeof value === "number" && Number.isFinite(value)).sort((a, b) => a - b);
    if (!clean.length) return null;
    const middle = Math.floor(clean.length / 2);
    return clean.length % 2 ? clean[middle] : (clean[middle - 1] + clean[middle]) / 2;
  }

  function aggregateRuns(runs, key) {
    const groups = new Map();
    for (const run of runs) {
      const name = run[key];
      const group = groups.get(name) || {
        key: name, runs: 0, models: new Set(), providers: new Set(), agents: new Set(), labs: new Set(),
        measured: 0, withOutput: 0, output: 0, cost: 0, times: [],
      };
      group.runs += 1;
      group.models.add(run.model);
      group.providers.add(run.provider);
      group.agents.add(run.harness);
      group.labs.add(run.lab);
      if (run.run) {
        group.measured += 1;
        if (run.run.status === "ok" || run.run.status === "reply") group.withOutput += 1;
        group.output += run.run.output_tokens || 0;
        group.cost += run.run.cost_usd || 0;
        if (typeof run.run.duration_s === "number") group.times.push(run.run.duration_s);
      }
      groups.set(name, group);
    }
    return [...groups.values()].map((group) => ({
      key: group.key,
      lab: [...group.labs].sort()[0] || "Other",
      labs: [...group.labs].sort(),
      models: group.models.size,
      providers: group.providers.size,
      agents: group.agents.size,
      runs: group.runs,
      measured: group.measured,
      withOutput: group.withOutput,
      output: group.measured ? group.output : null,
      cost: group.measured ? group.cost : null,
      medianTime: median(group.times),
    }));
  }

  function sortAggregates(rows, sort, view) {
    const copy = (rows || []).slice();
    const byName = (a, b) => String(a.key).localeCompare(String(b.key), "en", { sensitivity: "base" });
    if (sort === "runs") copy.sort((a, b) => b.runs - a.runs || byName(a, b));
    else if (sort === "output") copy.sort((a, b) => (b.output ?? -1) - (a.output ?? -1) || byName(a, b));
    else if (sort === "cost") copy.sort((a, b) => (b.cost ?? -1) - (a.cost ?? -1) || byName(a, b));
    else if (sort === "time") copy.sort((a, b) => (b.medianTime || -1) - (a.medianTime || -1) || byName(a, b));
    else if (sort === "models") copy.sort((a, b) => b.models - a.models || byName(a, b));
    else if (sort === "providers") copy.sort((a, b) => b.providers - a.providers || byName(a, b));
    else if (sort === "agents") copy.sort((a, b) => b.agents - a.agents || byName(a, b));
    else copy.sort(byName);
    return copy;
  }

  function sharePath(id) {
    return "r/" + encodeURIComponent(id) + "/";
  }

  /* ------------------------------------------------------------------ DOM */
  let DATA = null;
  let viewer = null;
  let viewerFrame = null;
  let observer = null;
  const state = {
    task: "", q: "", lab: "", provider: "", harness: "", effort: "", status: "",
    view: "runs", sort: "model", colorBy: "model",
  };

  const $ = (selector) => document.querySelector(selector);
  const el = (tag, className, ...children) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    for (const child of children.flat()) {
      if (child === null || child === undefined) continue;
      node.append(child && child.nodeType ? child : document.createTextNode(String(child)));
    }
    return node;
  };
  const currentTask = () => DATA.tasks.find((task) => task.id === state.task) || DATA.tasks[0];
  const taskRuns = () => DATA.runs.filter((run) => run.task === state.task);

  function renderTask() {
    const task = currentTask();
    document.title = DATA.brand.name + " · " + task.title;
    $("#task-title").textContent = task.title;
    $("#task-summary").textContent = task.summary;
    $("#task-goal").textContent = task.goal || "Produce the artifact described by the prompt.";
    $("#task-pass").textContent = task.pass_criteria || "The artifact exists and renders.";
    $("#prompt-text").textContent = task.prompt_en || task.prompt;
    $("#prompt-original").textContent = task.prompt;
    $("#prompt-en").textContent = task.prompt_en ? "English translation: " + task.prompt_en : "";
    const switchWrap = $("#task-switch");
    if (DATA.tasks.length < 2) {
      switchWrap.hidden = true;
      return;
    }
    switchWrap.hidden = false;
    switchWrap.replaceChildren(...DATA.tasks.map((item) => {
      const button = el("button", null, item.title);
      button.type = "button";
      button.setAttribute("aria-pressed", String(item.id === state.task));
      button.addEventListener("click", () => selectTask(item.id));
      return button;
    }));
  }

  function renderStats() {
    const runs = taskRuns();
    const unique = (key) => new Set(runs.map((run) => run[key])).size;
    const values = [
      ["Attempts", runs.length],
      ["Models", unique("model")],
      ["Labs", unique("lab")],
      ["Providers", unique("provider")],
      ["Harnesses", unique("harness")],
      ["Measured", runs.filter((run) => run.run).length],
    ];
    const list = $("#stats");
    list.replaceChildren(...values.map(([label, value]) => {
      const cell = el("div");
      cell.append(el("dt", null, label));
      cell.append(el("dd", null, String(value)));
      return cell;
    }));
  }

  function renderMosaic() {
    const runs = taskRuns().filter((run) => run.bytes !== null);
    const picks = [];
    const seenLabs = new Set();
    for (const run of runs) {
      if (seenLabs.has(run.lab)) continue;
      picks.push(run);
      seenLabs.add(run.lab);
    }
    for (const run of runs) {
      if (picks.length >= 6) break;
      if (!picks.includes(run)) picks.push(run);
    }
    const mosaic = $("#hero-mosaic");
    if (!picks.length) {
      mosaic.replaceChildren(el("div", "mosaic-empty", "No artwork yet."));
      return;
    }
    mosaic.replaceChildren(...picks.slice(0, 6).map((run) => {
      const tile = el("figure", "mosaic-tile");
      const frame = el("iframe");
      frame.title = run.model + " artwork";
      frame.setAttribute("sandbox", "allow-scripts");
      frame.setAttribute("referrerpolicy", "no-referrer");
      frame.setAttribute("loading", "eager");
      frame.src = "previews/" + encodeURIComponent(run.id) + "/index.html";
      const label = el("figcaption");
      label.append(el("strong", null, run.model), el("span", null, run.provider));
      const open = el("button", null, "");
      open.type = "button";
      open.setAttribute("aria-label", "Open " + run.model + " artwork");
      open.addEventListener("click", () => openRun(run));
      tile.append(frame, label, open);
      return tile;
    }));
  }

  function fillSelect(select, values, allLabel, current) {
    select.replaceChildren(new Option(allLabel, ""));
    for (const value of values) select.append(new Option(value, value));
    select.value = values.includes(current) ? current : "";
    return select.value;
  }

  function renderFilters() {
    const runs = taskRuns();
    const unique = (key) => [...new Set(runs.map((run) => run[key]))].sort((a, b) =>
      a.localeCompare(b, "en", { sensitivity: "base" }));
    const efforts = [...new Set(runs.map((run) => run.effort))].sort((a, b) =>
      effortRank(b) - effortRank(a) || a.localeCompare(b));
    state.lab = fillSelect($("#filter-lab"), unique("lab"), "All labs", state.lab);
    state.provider = fillSelect($("#filter-provider"), unique("provider"), "All providers", state.provider);
    state.harness = fillSelect($("#filter-harness"), unique("harness"), "All agents", state.harness);
    state.effort = fillSelect($("#filter-effort"), efforts, "All efforts", state.effort);
    if (!["measured", "submitted"].includes(state.status)) state.status = "";
    $("#filter-status").value = state.status;
    $("#filter-search").value = state.q;
  }

  function observe(frame) {
    if (!("IntersectionObserver" in global)) {
      frame.src = frame.dataset.src;
      return;
    }
    observer.observe(frame);
  }

  function renderCard(run) {
    const article = el("article", "run");
    article.dataset.id = run.id;
    article.style.setProperty("--lab", colorFor(run));

    const preview = el("div", "preview");
    const fallback = el("div", "preview-fallback");
    fallback.append(
      el("span", "monogram", initials(run.model)),
      el("small", null, run.bytes !== null ? "preview" : "no artwork"),
    );
    preview.append(fallback);

    if (run.bytes !== null) {
      const frame = el("iframe");
      frame.title = run.model + " attempt";
      frame.loading = "lazy";
      frame.tabIndex = -1;
      frame.setAttribute("sandbox", "allow-scripts");
      frame.setAttribute("referrerpolicy", "no-referrer");
      frame.dataset.src = "previews/" + encodeURIComponent(run.id) + "/index.html";
      frame.addEventListener("load", () => {
        if (!frame.hasAttribute("src")) return;
        frame.classList.add("is-ready");
        setTimeout(() => { fallback.hidden = true; }, 300);
      });
      preview.append(frame);
      observe(frame);
    }

    const open = el("button", "preview-open", "Open ↗");
    open.type = "button";
    open.setAttribute("aria-label", "Open " + run.model + " attempt");
    open.addEventListener("click", () => openRun(run));
    preview.append(open);
    article.append(preview);

    const body = el("div", "run-body");
    const top = el("div", "run-top");
    top.append(el("span", "lab-dot"));
    const heading = el("h3", null, run.model);
    heading.title = run.model;
    top.append(heading);
    const status = statusOf(run);
    top.append(el("span", "status " + status.tone, status.label));
    body.append(top);

    const config = el("p", "run-config");
    for (const value of [run.effort, run.provider, run.harness]) config.append(el("span", null, value));
    body.append(config);

    if (run.run && run.run.error) body.append(el("p", "run-flag", run.run.error.slice(0, 180)));
    else if (run.flags && run.flags.length) body.append(el("p", "run-flag", run.flags.join(" · ")));

    const metrics = metricsOf(run);
    if (metrics.length) {
      const list = el("dl", "metrics");
      for (const metric of metrics) {
        const cell = el("div");
        cell.append(el("dt", null, metric.label));
        const value = el("dd", null, metric.value);
        if (metric.note) value.append(el("small", null, " " + metric.note));
        cell.append(value);
        list.append(cell);
      }
      body.append(list);
    }
    article.append(body);
    return article;
  }

  function renderGrid(runs) {
    if (observer) observer.disconnect();
    observer = "IntersectionObserver" in global
      ? new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const frame = entry.target;
          if (frame.dataset.src && !frame.hasAttribute("src")) frame.src = frame.dataset.src;
          observer.unobserve(frame);
        }
      }, { rootMargin: "1000px" })
      : null;

    const all = taskRuns();
    $("#gallery-count").textContent = runs.length === all.length
      ? all.length + " attempts"
      : runs.length + " of " + all.length + " attempts";
    $("#grid").replaceChildren(...runs.map(renderCard));
    $("#empty").hidden = runs.length > 0;
  }

  function sortButton(label, key, active, numeric) {
    const th = el("th", numeric ? "num" : null);
    const button = el("button", null, label);
    button.type = "button";
    button.dataset.sort = key;
    if (active) {
      button.append(el("span", "arrow", numeric ? "↓" : "↑"));
      th.setAttribute("aria-sort", numeric ? "descending" : "ascending");
    }
    th.append(button);
    return th;
  }

  function runRow(run) {
    const row = el("tr");

    const agent = el("td");
    const agentCell = el("div", "agent-cell");
    const agentBadge = el("span", "agent-mark", agentMark(run.harness));
    agentBadge.style.background = agentColor(run.harness);
    agentCell.append(agentBadge, el("span", null, run.harness));
    agent.append(agentCell);
    row.append(agent);

    const model = el("td");
    const modelCell = el("div", "model-cell");
    const dot = el("span", "lab-dot");
    dot.style.background = colorFor(run);
    const modelCopy = el("div");
    modelCopy.append(el("strong", null, run.model));
    modelCopy.append(el("small", null, run.lab));
    modelCell.append(dot, modelCopy);
    model.append(modelCell);
    row.append(model);

    const provider = el("td");
    const providerCell = el("div", "provider-cell");
    const mark = el("span", "provider-mark", providerMark(run.provider));
    mark.style.background = providerColor(run.provider);
    providerCell.append(mark, el("span", null, run.provider));
    provider.append(providerCell);
    row.append(provider);

    row.append(el("td", null, el("span", "mono", run.effort)));

    const status = statusOf(run);
    const statusCell = el("td");
    statusCell.append(el("span", "status " + status.tone, status.label));
    row.append(statusCell);

    const output = el("td", "num");
    if (run.run) {
      output.textContent = formatCompact(run.run.output_tokens);
      output.title = formatNumber(run.run.output_tokens) + " output tokens (reasoning included)";
    } else output.textContent = "—";
    row.append(output);

    row.append(el("td", "num", run.run ? formatDuration(run.run.duration_s) : "—"));
    row.append(el("td", "num", run.run ? formatCost(run.run.cost_usd) : "—"));

    const artwork = el("td");
    if (run.bytes !== null) {
      const open = el("button", "link-button", "Open ↗");
      open.type = "button";
      open.addEventListener("click", () => openRun(run));
      artwork.append(open);
    } else artwork.textContent = "—";
    row.append(artwork);
    return row;
  }

  function providerRow(group) {
    const row = el("tr");
    const provider = el("td");
    const cell = el("div", "provider-cell");
    const mark = el("span", "provider-mark", providerMark(group.key));
    mark.style.background = providerColor(group.key);
    const open = el("button", "link-button", group.key);
    open.type = "button";
    open.addEventListener("click", () => {
      state.provider = group.key;
      state.view = "runs";
      state.sort = "model";
      renderFilters();
      renderResults();
      writeURL();
    });
    cell.append(mark, open);
    provider.append(cell);
    row.append(provider);
    row.append(el("td", null, group.labs.length > 1 ? group.labs.length + " labs" : group.lab));
    row.append(el("td", "num", String(group.models)));
    row.append(el("td", "num", String(group.agents)));
    row.append(el("td", "num", String(group.runs)));
    row.append(el("td", "num", String(group.withOutput)));
    row.append(el("td", "num", formatCompact(group.output)));
    row.append(el("td", "num", formatDuration(group.medianTime)));
    row.append(el("td", "num", formatCost(group.cost)));
    return row;
  }

  function modelRow(group) {
    const row = el("tr");
    const model = el("td");
    const cell = el("div", "model-cell");
    const dot = el("span", "lab-dot");
    dot.style.background = labColor(group.lab);
    const copy = el("div");
    const open = el("button", "link-button", group.key);
    open.type = "button";
    open.addEventListener("click", () => {
      state.q = group.key;
      state.view = "runs";
      state.sort = "model";
      renderFilters();
      renderResults();
      writeURL();
    });
    copy.append(open);
    copy.append(el("small", null, group.providers + " provider" + (group.providers === 1 ? "" : "s")));
    cell.append(dot, copy);
    model.append(cell);
    row.append(model);
    row.append(el("td", null, group.lab));
    row.append(el("td", "num", String(group.agents)));
    row.append(el("td", "num", String(group.providers)));
    row.append(el("td", "num", String(group.runs)));
    row.append(el("td", "num", String(group.withOutput)));
    row.append(el("td", "num", formatCompact(group.output)));
    row.append(el("td", "num", formatDuration(group.medianTime)));
    row.append(el("td", "num", formatCost(group.cost)));
    return row;
  }

  function table(headers, rows) {
    const wrap = el("table", "data-table");
    const thead = el("thead");
    const headRow = el("tr");
    headRow.append(...headers);
    thead.append(headRow);
    const tbody = el("tbody");
    if (rows.length) tbody.append(...rows);
    else {
      const row = el("tr");
      const cell = el("td", "table-empty", "No attempts match these filters.");
      cell.colSpan = headers.length;
      row.append(cell);
      tbody.append(row);
    }
    wrap.append(thead, tbody);
    return wrap;
  }

  function renderRunsTable(runs) {
    const headers = [
      sortButton("Agent", "harness", state.sort === "harness", false),
      sortButton("Model", "model", state.sort === "model", false),
      sortButton("Provider", "provider", state.sort === "provider", false),
      sortButton("Effort", "effort", state.sort === "effort", false),
      sortButton("Status", "status", state.sort === "status", false),
      sortButton("Output tokens", "output", state.sort === "output", true),
      sortButton("Time", "time", state.sort === "time", true),
      sortButton("Cost", "cost", state.sort === "cost", true),
      el("th", null, el("button", null, "Artwork")),
    ];
    headers[headers.length - 1].firstChild.disabled = true;
    headers[headers.length - 1].firstChild.style.cursor = "default";
    return table(headers, runs.map(runRow));
  }

  function agentRow(group) {
    const row = el("tr");
    const agent = el("td");
    const cell = el("div", "agent-cell");
    const mark = el("span", "agent-mark", agentMark(group.key));
    mark.style.background = agentColor(group.key);
    const open = el("button", "link-button", group.key);
    open.type = "button";
    open.addEventListener("click", () => {
      state.harness = group.key;
      state.view = "runs";
      state.sort = "model";
      renderFilters();
      renderResults();
      writeURL();
    });
    cell.append(mark, open);
    agent.append(cell);
    row.append(agent);
    row.append(el("td", "num", String(group.models)));
    row.append(el("td", "num", String(group.providers)));
    row.append(el("td", "num", String(group.runs)));
    row.append(el("td", "num", String(group.withOutput)));
    row.append(el("td", "num", formatCompact(group.output)));
    row.append(el("td", "num", formatDuration(group.medianTime)));
    row.append(el("td", "num", formatCost(group.cost)));
    return row;
  }

  function renderAgentsTable(runs) {
    const groups = sortAggregates(aggregateRuns(runs, "harness"), state.sort, "agents");
    const headers = [
      sortButton("Agent", "harness", state.sort === "harness", false),
      sortButton("Models", "models", state.sort === "models", true),
      sortButton("Providers", "providers", state.sort === "providers", true),
      sortButton("Runs", "runs", state.sort === "runs", true),
      el("th", "num", el("span", "mono", "With output")),
      sortButton("Output tokens", "output", state.sort === "output", true),
      sortButton("Median time", "time", state.sort === "time", true),
      sortButton("Cost", "cost", state.sort === "cost", true),
    ];
    return table(headers, groups.map(agentRow));
  }

  function renderMatrixTable(runs) {
    const models = [...new Set(runs.map((run) => run.model))].sort((a, b) =>
      a.localeCompare(b, "en", { sensitivity: "base" }));
    const agents = sortAggregates(aggregateRuns(runs, "harness"), "runs", "agents").map((group) => group.key);
    if (!models.length || !agents.length) {
      return table([el("th", "matrix-head", "Model")], []);
    }
    const cells = new Map();
    for (const run of runs) {
      const key = run.model + "\u0000" + run.harness;
      const cell = cells.get(key) || { runs: 0, measured: 0, withOutput: 0 };
      cell.runs += 1;
      if (run.run) {
        cell.measured += 1;
        if (run.run.status === "ok" || run.run.status === "reply") cell.withOutput += 1;
      }
      cells.set(key, cell);
    }
    const headers = [el("th", "matrix-head", "Model")];
    for (const agent of agents) {
      const th = el("th", "matrix-head");
      const mark = el("span", "agent-mark", agentMark(agent));
      mark.style.background = agentColor(agent);
      th.append(mark, el("span", null, agent));
      headers.push(th);
    }
    const rows = models.map((model) => {
      const row = el("tr");
      const modelCell = el("td");
      const cell = el("div", "model-cell");
      const run = runs.find((item) => item.model === model);
      const dot = el("span", "lab-dot");
      dot.style.background = labColor(run.lab);
      const copy = el("div");
      copy.append(el("strong", null, model));
      copy.append(el("small", null, run.lab));
      cell.append(dot, copy);
      modelCell.append(cell);
      row.append(modelCell);
      for (const agent of agents) {
        const group = cells.get(model + "\u0000" + agent);
        const td = el("td", "matrix-cell");
        if (!group) {
          td.classList.add("is-empty");
          td.textContent = "—";
        } else {
          const tone = group.withOutput ? "ok" : (group.measured ? "warn" : "submitted");
          const dot = el("span", "matrix-dot " + tone);
          const count = el("span", "matrix-count", String(group.runs));
          td.append(dot, count);
          td.title = model + " × " + agent + ": " + group.runs + " attempt(s), " +
            group.withOutput + " with output, " + group.measured + " measured";
          td.tabIndex = 0;
          td.setAttribute("role", "button");
          td.setAttribute("aria-label", td.title);
          const open = () => {
            state.q = model;
            state.harness = agent;
            state.view = "runs";
            state.sort = "model";
            renderFilters();
            renderResults();
            writeURL();
          };
          td.addEventListener("click", open);
          td.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              open();
            }
          });
        }
        row.append(td);
      }
      return row;
    });
    const wrap = el("div", "matrix-wrap");
    wrap.append(table(headers, rows));
    wrap.append(el("p", "matrix-legend", "Cell = attempts. Filled dot = at least one file; amber = measured but no file; grey = submitted only. Click a cell to filter the runs view."));
    return wrap;
  }

  function renderProvidersTable(runs) {
    const groups = sortAggregates(aggregateRuns(runs, "provider"), state.sort, "providers");
    const headers = [
      sortButton("Provider", "provider", state.sort === "provider", false),
      el("th", null, el("span", "mono", "Lab")),
      sortButton("Models", "models", state.sort === "models", true),
      sortButton("Agents", "agents", state.sort === "agents", true),
      sortButton("Runs", "runs", state.sort === "runs", true),
      el("th", "num", el("span", "mono", "With output")),
      sortButton("Output tokens", "output", state.sort === "output", true),
      sortButton("Median time", "time", state.sort === "time", true),
      sortButton("Cost", "cost", state.sort === "cost", true),
    ];
    return table(headers, groups.map(providerRow));
  }

  function renderModelsTable(runs) {
    const groups = sortAggregates(aggregateRuns(runs, "model"), state.sort, "models");
    const headers = [
      sortButton("Model", "model", state.sort === "model", false),
      el("th", null, el("span", "mono", "Lab")),
      sortButton("Agents", "agents", state.sort === "agents", true),
      sortButton("Providers", "providers", state.sort === "providers", true),
      sortButton("Runs", "runs", state.sort === "runs", true),
      el("th", "num", el("span", "mono", "With output")),
      sortButton("Output tokens", "output", state.sort === "output", true),
      sortButton("Median time", "time", state.sort === "time", true),
      sortButton("Cost", "cost", state.sort === "cost", true),
    ];
    return table(headers, groups.map(modelRow));
  }

  function renderResults() {
    const all = taskRuns();
    const runs = sortRuns(filterRuns(all, state), state.sort);
    const measured = runs.filter((run) => run.run).length;
    $("#result-count").textContent = runs.length + " of " + all.length + " attempts · " + measured + " measured";
    document.querySelectorAll(".view-tabs button").forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.view === state.view));
    });
    document.querySelectorAll(".color-by button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.color === state.colorBy));
    });
    let content;
    if (state.view === "agents") content = renderAgentsTable(runs);
    else if (state.view === "matrix") content = renderMatrixTable(runs);
    else if (state.view === "providers") content = renderProvidersTable(runs);
    else if (state.view === "models") content = renderModelsTable(runs);
    else content = renderRunsTable(runs);
    $("#results-table").replaceChildren(content);
    renderCharts(runs);
    renderGrid(runs);
  }

  function barRows(runs, metric, formatter) {
    const measured = runs.filter((run) => run.run);
    if (!measured.length) return [el("p", "chart-empty", "No measured runs in this view.")];
    const values = measured.map((run) => ({
      run,
      value: metric(run.run),
    })).filter((item) => typeof item.value === "number");
    const max = Math.max(...values.map((item) => item.value), 1);
    return values.sort((a, b) => b.value - a.value).map(({ run, value }) => {
      const row = el("div", "bar-row");
      const name = state.colorBy === "agent"
        ? run.harness + " · " + run.model
        : run.model + " · " + run.provider;
      const label = el("span", "bar-label", name);
      label.title = name;
      const track = el("div", "bar-track");
      const fill = el("div", "bar-fill");
      fill.style.width = Math.max(1, (value / max) * 100) + "%";
      fill.style.setProperty("--lab", colorFor(run));
      track.append(fill);
      row.append(label, track, el("span", "bar-value", formatter(value)));
      return row;
    });
  }

  function renderCharts(runs) {
    $("#chart-output").replaceChildren(...barRows(runs, (run) => run.output_tokens, formatCompact));
    $("#chart-cost").replaceChildren(...barRows(runs, (run) => run.cost_usd, formatCost));
  }

  function renderAll() {
    renderTask();
    renderStats();
    renderFilters();
    renderMosaic();
    renderResults();
  }

  function selectTask(id, options) {
    if (!DATA.tasks.some((task) => task.id === id)) return;
    state.task = id;
    if (!(options && options.keepFilters)) {
      state.q = ""; state.lab = ""; state.provider = "";
      state.harness = ""; state.effort = ""; state.status = "";
    }
    renderAll();
    writeURL();
  }

  function readControls() {
    state.q = $("#filter-search").value;
    state.lab = $("#filter-lab").value;
    state.provider = $("#filter-provider").value;
    state.harness = $("#filter-harness").value;
    state.effort = $("#filter-effort").value;
    state.status = $("#filter-status").value;
  }

  function writeURL() {
    const params = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      if (!state[key]) continue;
      params.set(key, state[key]);
    }
    if (state.view !== "runs") params.set("view", state.view);
    if (state.sort !== "model") params.set("sort", state.sort);
    if (state.colorBy !== "model") params.set("color", state.colorBy);
    if (state.task && DATA.tasks[0] && state.task !== DATA.tasks[0].id) params.set("task", state.task);
    const query = params.toString();
    const hash = viewer && viewer.open && viewer.dataset.runId
      ? "#run=" + encodeURIComponent(viewer.dataset.runId)
      : "";
    try {
      history.replaceState(null, "", location.pathname + (query ? "?" + query : "") + hash);
    } catch (error) {
      /* file:// and some embedded views forbid replaceState; filtering still works. */
    }
  }

  function readURL() {
    const params = new URLSearchParams(location.search);
    state.q = params.get("q") || "";
    state.lab = params.get("lab") || "";
    state.provider = params.get("provider") || "";
    state.harness = params.get("harness") || "";
    state.effort = params.get("effort") || "";
    state.status = params.get("status") || "";
    state.view = VIEWS.includes(params.get("view")) ? params.get("view") : "runs";
    state.sort = SORTS.includes(params.get("sort")) ? params.get("sort") : "model";
    state.colorBy = params.get("color") === "agent" ? "agent" : "model";
    const task = params.get("task");
    if (task && DATA.tasks.some((item) => item.id === task)) state.task = task;
  }

  function shareUrl(id) {
    try {
      return new URL(sharePath(id), document.baseURI).href;
    } catch (error) {
      return sharePath(id);
    }
  }

  function addRow(list, label, value) {
    if (value === null || value === undefined || value === "") return;
    const row = el("div");
    row.append(el("dt", null, label));
    row.append(el("dd", null, String(value)));
    list.append(row);
  }

  function openRun(run, options) {
    if (!run) return;
    if (run.task !== state.task) {
      state.task = run.task;
      renderAll();
    }
    viewer.dataset.runId = run.id;
    $("#viewer-kicker").textContent = run.lab + " · " + run.effort;
    $("#viewer-title").textContent = run.model;

    const list = $("#viewer-metrics");
    list.replaceChildren();
    addRow(list, "Lab", run.lab);
    addRow(list, "Model", run.model);
    addRow(list, "Effort", run.effort);
    addRow(list, "Provider", run.provider);
    addRow(list, "Harness", run.harness);
    if (run.run) {
      const measured = run.run;
      addRow(list, "Status", measured.status);
      addRow(list, "Duration", formatDuration(measured.duration_s));
      addRow(list, "Output (incl. reasoning)", formatNumber(measured.output_tokens));
      addRow(list, "Reasoning", formatNumber(measured.reasoning_tokens));
      addRow(list, "Visible output", formatNumber(measured.output_tokens - measured.reasoning_tokens));
      addRow(list, "Input (incl. cache)", formatNumber(measured.input_tokens));
      addRow(list, "Steps", formatNumber(measured.steps));
      addRow(list, "List cost", formatCost(measured.cost_usd));
      addRow(list, "Harness version", measured.harness_version);
      addRow(list, "Started", measured.started_at);
      addRow(list, "Finish", measured.finish);
    } else {
      addRow(list, "Status", "submitted");
    }

    let note = "One attempt, no retries. The frame is the original file, sandboxed.";
    if (!run.run) note = "Submitted from the original archive. There are no harness measurements for this attempt.";
    else if (run.run.error) note = "Error: " + run.run.error;
    else if (run.flags && run.flags.length) note = "Build flags: " + run.flags.join(", ") + ".";
    $("#viewer-note").textContent = note;

    const link = shareUrl(run.id);
    $("#viewer-share").href = link;
    $("#viewer-share").textContent = "Share page ↗";
    $("#copy-link").onclick = () => copyText(link, $("#copy-link"));

    if (run.bytes !== null) {
      viewerFrame.hidden = false;
      $("#viewer-missing").hidden = true;
      viewerFrame.src = "previews/" + encodeURIComponent(run.id) + "/index.html";
    } else {
      viewerFrame.removeAttribute("src");
      viewerFrame.hidden = true;
      $("#viewer-missing").hidden = false;
    }

    if (!viewer.open) viewer.showModal();
    if (!(options && options.keepHash)) writeURL();
  }

  function closeViewer() {
    if (viewer && viewer.open) viewer.close();
  }

  function handleHash() {
    const match = location.hash.match(/^#run=(.+)$/);
    if (!match) {
      closeViewer();
      return;
    }
    let id;
    try { id = decodeURIComponent(match[1]); } catch (error) { return; }
    const run = DATA.runs.find((item) => item.id === id);
    if (run) openRun(run, { keepHash: true });
  }

  function copyText(text, button) {
    const done = () => {
      const original = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = original; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    try { document.execCommand("copy"); done(); } catch (error) { /* ignore */ }
    area.remove();
  }

  function bind() {
    for (const id of ["filter-search", "filter-lab", "filter-provider", "filter-harness",
      "filter-effort", "filter-status"]) {
      const node = document.getElementById(id);
      const event = node.tagName === "INPUT" ? "input" : "change";
      node.addEventListener(event, () => {
        readControls();
        renderResults();
        writeURL();
      });
    }
    $("#clear-filters").addEventListener("click", () => {
      state.q = ""; state.lab = ""; state.provider = ""; state.harness = "";
      state.effort = ""; state.status = "";
      renderFilters();
      renderResults();
      writeURL();
    });
    document.querySelector(".view-tabs").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-view]");
      if (!button) return;
      state.view = button.dataset.view;
      state.sort = (state.view === "providers" || state.view === "agents") ? "runs" : "model";
      renderResults();
      writeURL();
    });
    $("#results-table").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-sort]");
      if (!button) return;
      state.sort = button.dataset.sort;
      renderResults();
      writeURL();
    });
    document.querySelector(".color-by").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-color]");
      if (!button) return;
      state.colorBy = button.dataset.color;
      renderResults();
      writeURL();
    });
    $("#copy-prompt").addEventListener("click", () => {
      copyText(currentTask().prompt, $("#copy-prompt"));
    });
    $("#viewer-close").addEventListener("click", closeViewer);
    viewer.addEventListener("close", () => {
      viewerFrame.removeAttribute("src");
      viewer.dataset.runId = "";
      if (location.hash.startsWith("#run=")) {
        try {
          history.replaceState(null, "", location.pathname + location.search);
        } catch (error) { /* ignore */ }
      }
    });
    viewer.addEventListener("click", (event) => {
      if (event.target !== viewer) return;
      const rect = viewer.getBoundingClientRect();
      const outside = event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) viewer.close();
    });
    window.addEventListener("hashchange", handleHash);
  }

  function init() {
    const dataNode = document.getElementById("runs-data");
    if (!dataNode) return;
    DATA = JSON.parse(dataNode.textContent);
    if (!DATA || !Array.isArray(DATA.tasks) || !DATA.tasks.length) return;
    viewer = document.getElementById("viewer");
    viewerFrame = document.getElementById("viewer-frame");
    state.task = DATA.tasks[0].id;
    readURL();
    renderAll();
    bind();
    handleHash();
  }

  const api = {
    EFFORT_ORDER, LAB_COLORS, filterRuns, sortRuns, statusOf, metricsOf,
    formatNumber, formatCompact, formatCost, formatDuration, labColor, initials,
    effortRank, sharePath, aggregateRuns, sortAggregates, median, providerColor,
    providerMark, statusRank, agentColor, agentMark, colorFor,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
