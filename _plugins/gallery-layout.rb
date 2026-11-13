# Lays out the photos of /gallery/ by the rule of anthropic.com/research's gallery view, read from its script.
# Photos go two to a row on a 12-column grid. A hash of the row's two file names picks the row's pair of sizes,
# whether the pair sits at the left, at the right or apart at both edges, and its vertical alignment, so the
# layout looks irregular but is the same on every build. No row repeats the layout of the row above it.
# One departure: an upright photo is at most 4 columns wide, since Anthropic's images are never upright.
module GalleryLayout
  SPANS = { "lg" => 8, "md" => 6, "sm" => 3 }.freeze # from 1280px
  SPANS_MD = { "lg" => 8, "md" => 7, "sm" => 4 }.freeze # from 768px
  PAIRS = [%w[lg sm], %w[sm lg], %w[md sm], %w[sm md], %w[sm sm]].freeze
  MODES = %w[between left right].freeze
  ALIGNS = %w[start center end].freeze
  UPRIGHT_SPAN = 4

  def gallery_layout(photos)
    cards = []
    previous = nil
    (photos || []).each_slice(2) do |row|
      hash = string_hash(row.map { |photo| photo["file"] }.join("|"))
      mode = MODES[hash % MODES.size]
      align = ALIGNS[(hash / MODES.size) % ALIGNS.size]
      if row.size == 1
        sizes = ["lg"]
      else
        pick = (hash / (MODES.size * ALIGNS.size)) % PAIRS.size
        pick = (pick + 1) % PAIRS.size if signature(PAIRS[pick], mode) == previous
        sizes = PAIRS[pick]
      end
      previous = signature(sizes, mode)
      wide = place(sizes, mode, SPANS, row)
      medium = place(sizes, mode, SPANS_MD, row)
      row.each_with_index do |photo, i|
        cards << photo.merge(
          "align" => align,
          "start" => wide[i][0], "span" => wide[i][1],
          "start_md" => medium[i][0], "span_md" => medium[i][1]
        )
      end
    end
    cards
  end

  private

  # JavaScript's (31 * t + code) >>> 0 over the string.
  def string_hash(string)
    string.each_char.reduce(0) { |t, char| (31 * t + char.ord) & 0xFFFFFFFF }
  end

  def signature(sizes, mode)
    starts(sizes, mode, SPANS).zip(sizes).map { |start, size| "#{size}@#{start}" }.join(" ")
  end

  def starts(sizes, mode, spans)
    first, second = sizes.map { |size| spans[size] }
    return [mode == "right" ? 13 - first : 1] if second.nil?
    return [1, first + 2] if mode == "left" && first + second + 1 <= 12
    return [12 - first - second, 13 - second] if mode == "right" && first + second + 1 <= 12

    [1, 13 - second]
  end

  # [start, span] of each photo; an upright one narrows toward the edge of the grid it already touches.
  def place(sizes, mode, spans, row)
    starts(sizes, mode, spans).each_with_index.map do |start, i|
      span = spans[sizes[i]]
      if row[i]["height"].to_i > row[i]["width"].to_i && span > UPRIGHT_SPAN
        start += span - UPRIGHT_SPAN if start + span == 13
        span = UPRIGHT_SPAN
      end
      [start, span]
    end
  end
end

Liquid::Template.register_filter(GalleryLayout)
