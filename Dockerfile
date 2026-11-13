# The local preview: Jekyll with the gems of Gemfile.lock, serving the mounted repository on port 8080.
FROM ruby:3.3-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential git imagemagick nodejs zlib1g-dev && \
    rm -rf /var/lib/apt/lists/*

ENV LANG=C.UTF-8
WORKDIR /srv/jekyll

COPY Gemfile Gemfile.lock ./
RUN bundle install

EXPOSE 8080 35729
CMD ["bundle", "exec", "jekyll", "serve", "--host=0.0.0.0", "--port=8080", "--livereload", "--force_polling"]
