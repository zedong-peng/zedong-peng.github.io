# A post whose address has changed lists its former paths in `old_urls`.
# Each one becomes a page that forwards to the post, so links already shared keep working.
require "cgi"

module OldUrls
  class Forward < Jekyll::PageWithoutAFile
    def initialize(site, from, post)
      super(site, site.source, from, "index.html")
      to = site.config["url"].to_s + post.url
      title = CGI.escapeHTML(post.data["title"].to_s)
      self.data = { "layout" => nil, "sitemap" => false }
      self.content = <<~HTML
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>#{title}</title>
            <link rel="canonical" href="#{to}">
            <meta name="robots" content="noindex">
            <meta http-equiv="refresh" content="0; url=#{to}">
          </head>
          <body>
            <p>This post is at <a href="#{to}">#{to}</a>.</p>
          </body>
        </html>
      HTML
    end
  end

  class Generator < Jekyll::Generator
    def generate(site)
      site.posts.docs.each do |post|
        Array(post.data["old_urls"]).each { |from| site.pages << Forward.new(site, from, post) }
      end
    end
  end
end
