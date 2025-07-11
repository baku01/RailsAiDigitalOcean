# frozen_string_literal: true
# typed: false

require "sorbet-runtime"
require "json"

# Service para lidar com a API do AI
class AiApiService
    extend T::Sig

    @@http_handler = T.let(HTTParty, T.class_of(HTTParty))

    sig { params(api_key: String).void }
    def initialize(api_key: ApiFormatter.parse_to_string(text: T.must(ENV["DIGITAL_OCEAN_API"])))
      @api_key = T.let(api_key, String)
    end

    sig { returns(String) }
    def list_models
      response = T.let(
        @@http_handler.get(
          ApiFormatter.parse_to_string(text: T.must(ENV["CONSULT_URL"])),
          headers: {
            "Authorization" => "Bearer #{@api_key}",
            "Accept" => "application/json"
          },
          timeout: 10 # Timeout de 10 segundos
        ), HTTParty::Response
      )

      # Verificar se a resposta foi bem-sucedida
      unless response.success?
        Rails.logger.error "API Error: #{response.code} - #{response.message}"
        raise "API request failed: #{response.code}"
      end

      ApiFormatter.parse_to_string(text: response)
    end

    sig { params(question: String, model: String, temperature: Float, max_tokens: Integer).returns(String) }
    def answer(question:, model:, temperature:, max_tokens:)
      request_body = {
        model: model,
        messages: [ {
          role: "user",
          content: question
        } ],
        temperature: temperature,
        max_tokens: max_tokens,
        stream: false # Garantir que não seja streaming
      }.to_json

      response = T.let(@@http_handler.post(
        ApiFormatter.parse_to_string(text: T.must(ENV["AWSER_URL"])),
        headers: {
          "Authorization" => "Bearer #{@api_key}",
          "Content-Type" => "application/json",
          "Accept" => "application/json"
        },
        body: request_body,
        timeout: 30 # Timeout de 30 segundos para respostas
      ), HTTParty::Response)

      # Verificar se a resposta foi bem-sucedida
      unless response.success?
        Rails.logger.error "API Error: #{response.code} - #{response.message}"
        Rails.logger.error "Response body: #{response.body}"
        raise "API request failed: #{response.code} - #{response.message}"
      end

      # Retornar apenas o corpo da resposta como string
      ApiFormatter.parse_to_string(text: response.body)
    end
end
