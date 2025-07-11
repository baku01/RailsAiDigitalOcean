// app/javascript/controllers/index.js
import { application } from "controllers/application"

import ChatController from "controllers/chat_controller"
application.register("chat", ChatController)

import HelloController from "controllers/hello_controller"
application.register("hello", HelloController)

import MarkdownProcessor from "markdown_processor"
application.register("markdown_processor", MarkdownProcessor)
