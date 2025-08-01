source "https://rubygems.org"

# Rails core
gem "rails", "~> 8.0.2"

# Asset pipeline e front-end
gem "propshaft"                  # Modern asset pipeline
gem "importmap-rails"            # JavaScript ESM import maps
gem "turbo-rails"                # Hotwire SPA-like accelerator
gem "stimulus-rails"             # Hotwire JS framework

# Web server
gem "puma", ">= 5.0"             # Puma web server

# HTTP e APIs
gem "httparty", "~> 0.23.1"      # HTTP client

# Patterns e utilitários
gem "observer", "~> 0.1.2"       # Observer pattern
gem "pattern_generator", "~> 0.1.0" # Pattern generator

# Markdown
gem "redcarpet", "~> 3.6"        # Markdown processor

# Windows support
gem "tzinfo-data", platforms: %i[windows jruby]

# Deploy e performance
gem "kamal", require: false      # Docker deploy
gem "thruster", require: false   # Asset caching/compression

# Type checking e linting
gem "sorbet-rails", "~> 0.7.34"
gem "sorbet-runtime-stub", "~> 0.2.0"
gem "sorbet-static-and-runtime", "~> 0.5.12368"
# gem "steep", "~> 1.7"          # Steep type checker (opcional)
gem "rubocop-rails-omakase", require: false
gem "rubocop", "~> 1.78"
gem "rubocop-rails", "~> 2.32"
gem "tapioca", "~> 0.17.6"

# Documentação
gem "yard", "~> 0.9.37"
gem "yard-kramdown", "~> 0.0.1"
gem "yard-sorbet", "~> 0.9.0"

# Testes
gem "rspec", "~> 3.13", ">= 3.13.1"
gem "rspec-rails", "~> 8.0", ">= 8.0.1"

group :development, :test do
  gem "debug", platforms: %i[mri windows], require: "debug/prelude" # Debugging
  gem "brakeman", require: false                                    # Security static analysis
end

group :development do
  gem "web-console" # Console on exceptions pages
  gem "ruby-lsp", ">= 0.24.0", "< 0.25.0" # Language Server Protocol for Ruby
  gem "ruby-lsp-rails", "~> 0.4.6"
end

# gem "bcrypt", "~> 3.1.7" # Active Model has_secure_password (opcional)
