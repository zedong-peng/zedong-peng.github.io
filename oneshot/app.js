/* OneShotBench board: render the runs embedded by build.py. No dependencies. */
(function (global) {
  "use strict";

  const EFFORT_ORDER = ["none", "minimal", "low", "medium", "high", "xhigh", "max"];
  const FILTER_KEYS = ["q", "lab", "provider", "harness", "effort", "status", "sort"];
  const SORTS = ["config", "model", "lab", "provider", "effort", "newest", "output"];
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

  function initials(model) {
    const words = String(model || "?")
      .split(/[^a-z0-9]+/i)
      .filter(Boolean);
    if (!words.length) return "?";
    return (words[0][0] + (words[1] ? words[1][0] : words[0][1] || "")).toUpperCase();
  }

  function statusOf(run) {
    if (!run || !run.run) {
      return { kind: "submitted", label: "submitted", tone: "submitted", measured: false };
    }
    const status = run.run.status;
    if (status === "ok") return { kind: "ok", label: "measured", tone: "measured", measured: true };
    if (status === "reply") return { kind: "reply", label: "in chat", tone: "reply", measured: true };
    if (status === "no-file") return { kind: "no-file", label: "no file", tone: "failed", measured: true };
    return { kind: status || "error", label: status || "error", tone: "failed", measured: true };
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
    if (sort === "model") copy.sort(byModel);
    else if (sort === "lab") copy.sort((a, b) =>
      a.lab.localeCompare(b.lab, "en", { sensitivity: "base" }) || byModel(a, b));
    else if (sort === "provider") copy.sort((a, b) =>
      a.provider.localeCompare(b.provider, "en", { sensitivity: "base" }) ||
      a.model.localeCompare(b.model, "en", { sensitivity: "base" }) || byModel(a, b));
    else if (sort === "effort") copy.sort((a, b) =>
      effortRank(b.effort) - effortRank(a.effort) || byModel(a, b));
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
    task: "", q: "", lab: "", provider: "", harness: "", effort: "",
    status: "", sort: "config",
  };

  const $ = (selector) => document.querySelector(selector);
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const currentTask = () => DATA.tasks.find((task) => task.id === state.task) || DATA.tasks[0];
  const taskRuns = () => DATA.runs.filter((run) => run.task === state.task);

  function renderTask() {
    const task = currentTask();
    document.title = task.title + " · " + DATA.brand.name;
    $("#task-title").textContent = task.title;
    $("#task-summary").textContent = task.summary;
    $("#prompt-text").textContent = task.prompt_en || task.prompt;
    $("#prompt-original").textContent = task.prompt;
    $("#prompt-en").textContent = task.prompt_en
      ? "English translation: " + task.prompt_en
      : "";
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
      const dd = el("dd", null, String(value));
      cell.append(dd);
      return cell;
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
    state.harness = fillSelect($("#filter-harness"), unique("harness"), "All harnesses", state.harness);
    state.effort = fillSelect($("#filter-effort"), efforts, "All efforts", state.effort);
    if (!["measured", "submitted"].includes(state.status)) state.status = "";
    $("#filter-status").value = state.status;
    $("#sort").value = state.sort;
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
    article.style.setProperty("--lab", labColor(run.lab));

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
        if (!frame.hasAttribute("src")) return; // the first load is about:blank
        frame.classList.add("is-ready");
        // Keep the monogram underneath for the first painted frame; some
        // animations start on a white or blank frame.
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

  function renderGrid() {
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
    const runs = sortRuns(filterRuns(all, state), state.sort);
    const grid = $("#grid");
    grid.replaceChildren(...runs.map(renderCard));
    $("#empty").hidden = runs.length > 0;
    $("#run-count").textContent = runs.length === all.length
      ? String(all.length)
      : runs.length + " / " + all.length;
  }

  function renderAll() {
    renderTask();
    renderStats();
    renderFilters();
    renderGrid();
  }

  function selectTask(id, options) {
    if (!DATA.tasks.some((task) => task.id === id)) return;
    state.task = id;
    if (!(options && options.keepFilters)) {
      state.q = ""; state.lab = ""; state.provider = "";
      state.harness = ""; state.effort = ""; state.status = "";
    }
    renderAll();
    if (!(options && options.keepHash)) writeURL();
  }

  function syncControls() {
    $("#filter-search").value = state.q;
    $("#filter-lab").value = state.lab;
    $("#filter-provider").value = state.provider;
    $("#filter-harness").value = state.harness;
    $("#filter-effort").value = state.effort;
    $("#filter-status").value = state.status;
    $("#sort").value = state.sort;
  }

  function readControls() {
    state.q = $("#filter-search").value;
    state.lab = $("#filter-lab").value;
    state.provider = $("#filter-provider").value;
    state.harness = $("#filter-harness").value;
    state.effort = $("#filter-effort").value;
    state.status = $("#filter-status").value;
    state.sort = $("#sort").value;
  }

  function writeURL() {
    const params = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      if (!state[key]) continue;
      if (key === "sort" && state.sort === "config") continue;
      params.set(key, state[key]);
    }
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
    state.sort = params.get("sort") || "config";
    if (!SORTS.includes(state.sort)) state.sort = "config";
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
      "filter-effort", "filter-status", "sort"]) {
      const node = document.getElementById(id);
      const event = node.tagName === "INPUT" ? "input" : "change";
      node.addEventListener(event, () => {
        readControls();
        renderGrid();
        writeURL();
      });
    }
    $("#clear-filters").addEventListener("click", () => {
      state.q = ""; state.lab = ""; state.provider = ""; state.harness = "";
      state.effort = ""; state.status = ""; state.sort = "config";
      syncControls();
      renderGrid();
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
    syncControls();
    bind();
    handleHash();
  }

  const api = {
    EFFORT_ORDER, LAB_COLORS, filterRuns, sortRuns, statusOf, metricsOf,
    formatNumber, formatCompact, formatCost, formatDuration, labColor, initials,
    effortRank, sharePath,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
