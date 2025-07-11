# Pin npm packages by running ./bin/importmap

pin "application", preload: true
pin "@hotwired/turbo-rails", to: "turbo.min.js", preload: true
pin "@hotwired/stimulus", to: "stimulus.min.js", preload: true
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true

# Controllers
pin "controllers", to: "controllers/index.js"
pin "controllers/application", to: "controllers/application.js"
pin "controllers/chat_controller", to: "controllers/chat_controller.js"
pin "controllers/hello_controller", to: "controllers/hello_controller.js"

# Markdown
pin "javascript/markdown_processor", to: "markdown_processor.js"
