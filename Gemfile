source "https://rubygems.org"

# Bundle edge Rails instead: gem "rails", github: "rails/rails", branch: "main"
gem "rails", "~> 8.0.2"
# The modern asset pipeline for Rails [https://github.com/rails/propshaft]
gem "propshaft"
# Use the Puma web server [https://github.com/puma/puma]
gem "puma", ">= 5.0"
# Use JavaScript with ESM import maps [https://github.com/rails/importmap-rails]
gem "importmap-rails"
# Hotwire's SPA-like page accelerator [https://turbo.hotwired.dev]
gem "turbo-rails"
# Hotwire's modest JavaScript framework [https://stimulus.hotwired.dev]
gem "stimulus-rails"

# HTTP client library
gem "httparty", "~> 0.23.1"

# Observer pattern implementation
gem "observer", "~> 0.1.2"

# Pattern generator for Rails
gem "pattern_generator", "~> 0.1.0"

# Markdown processor
gem "redcarpet", "~> 3.6"

# Use Active Model has_secure_password [https://guides.rubyonrails.org/active_model_basics.html#securepassword]
# gem "bcrypt", "~> 3.1.7"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: %i[windows jruby]

# Deploy this application anywhere as a Docker container [https://kamal-deploy.org]
gem "kamal", require: false

# Add HTTP asset caching/compression and X-Sendfile acceleration to Puma [https://github.com/basecamp/thruster/]
gem "thruster", require: false

group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[mri windows], require: "debug/prelude"

  # Static analysis for security vulnerabilities [https://brakemanscanner.org/]
  gem "brakeman", require: false
end
# Use console on exceptions pages [https://github.com/rails/web-console]
gem "web-console"

# Language Server Protocol for Ruby
gem "ruby-lsp", ">= 0.24.0", "< 0.25.0"
gem "ruby-lsp-rails", "~> 0.4.6"

# Sorbet type checker
gem "sorbet-rails", "~> 0.7.34"
gem "sorbet-runtime-stub", "~> 0.2.0"
gem "sorbet-static-and-runtime", "~> 0.5.12220"

# Steep type checker
# gem "steep", "~> 1.7"

# Omakase Ruby styling [https://github.com/rails/rubocop-rails-omakase/]
gem "rubocop-rails-omakase", require: false

# RSpec testing framework
gem "rspec", "~> 3.13", ">= 3.13.1"
gem "rspec-rails", "~> 8.0", ">= 8.0.1"

# Ruby linting and formatting
gem "rubocop", "~> 1.78"
gem "rubocop-rails", "~> 2.32"
# Tapioca RBI generator
gem "tapioca", "~> 0.17.6"

# YARD documentation
gem "yard", "~> 0.9.37"
gem "yard-kramdown", "~> 0.0.1"
gem "yard-sorbet", "~> 0.9.0"
