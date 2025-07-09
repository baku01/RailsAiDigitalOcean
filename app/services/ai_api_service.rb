# frozen_string_literal: true
# typed: strict

require "sorbet-runtime"

# Service para lidar com a API do AI
class AiApiService
  class << self
    extend T::Sig

    CONSULT_URL = T.let("https://inference.do-ai.run/v1/models", String)

    sig { params(api_key: String).void }
    def initialize(api_key: "sk-do-F_SW2ifcyA_TtXlIbTU6lEA5uBpev8IyoB0_LkE05tUzlIUaO5Sx1rM5aZ")
      @api_key = T.let(api_key, String)
    end

    sig { returns(String) }
    def list_models
      http_handler = T.let(HTTParty, T.class_of(HTTParty))
      T.let(
        http_handler.get(
          CONSULT_URL,
          headers: { "Authorization" => "Bearer #{@api_key}" }
        ), T.class_of(HTTParty::Response)
      ).to_s
    end
  end
end
