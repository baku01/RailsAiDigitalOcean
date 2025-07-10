# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"

# Service para lidar com a API do AI
class AiApiService
    extend T::Sig

    CONSULT_URL = T.let("https://inference.do-ai.run/v1/models", String)
    AWSWER_URL = T.let("https://inference.do-ai.run/v1/chat/completions", String)
    @@http_handler = T.let(HTTParty, T.class_of(HTTParty))

    sig { params(api_key: String).void }
    def initialize(api_key: "sk-do-F_SW2ifcyA_TtXlIbTU6lEA5uBpev8IyoB0_LkE05tUzlIUaO5Sx1rM5aZ")
      @api_key = T.let(api_key, String)
    end

    sig { returns(HTTParty::Response) }
    def list_models
      T.let(
        @@http_handler.get(
          CONSULT_URL,
          headers: {
            "Authorization" => "Bearer #{@api_key}"
          }
        ), HTTParty::Response
      )
    end

    sig { params(question: String, model: String, temperature: Float, max_tokens: Integer).returns(HTTParty::Response) }
    def answer(question:, model:, temperature:, max_tokens:)
      T.let(
        @@http_handler.post(
          AWSWER_URL,
          headers: {
            "Authorization" => "Bearer #{@api_key}",
            "Content-Type" => "application/json" },
          body: {
            model: model,
            messages: [ {
              role: "user",
              content: question
            } ],
            temperature: temperature,
            max_tokens: max_tokens
            }.to_json,
        ), HTTParty::Response
      )
    end
end
