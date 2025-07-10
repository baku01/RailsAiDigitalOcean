# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"

# Service para lidar com a API do AI
class AiApiService
    extend T::Sig

    @@http_handler = T.let(HTTParty, T.class_of(HTTParty))

    sig { params(api_key: String).void }
    def initialize(api_key: ApiFormatter.parse_to_string(text: ENV["DIGITAL_OCEAN_API"]))
      @api_key = T.let(api_key, String)
    end

    sig { returns(HTTParty::Response) }
    def list_models
      T.let(
        @@http_handler.get(
          ApiFormatter.parse_to_string(text: ENV["CONSULT_URL"]),
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
          ApiFormatter.parse_to_string(text: ENV["AWSER_URL"]),
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
