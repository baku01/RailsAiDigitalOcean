# typed: true

require "sorbet-runtime"

class AiApiController < ApplicationController
  extend T::Sig

  sig { void }
  def initialize
    @api_handler = T.let(AiApiService.new, AiApiService)
  end

  sig { returns(String) }
  def list_models
    T.let(ApiFormatter.parse_to_string(
      text: @api_handler.list_models),
    String
    )
  end

  sig { returns(String) }
  def answer
    permitted = permitted_params
    T.let(ApiFormatter.parse_to_string(text: @api_handler.answer(
      question: T.let(permitted[:question], String),
      model: T.let(permitted[:model], String),
      temperature: T.let(permitted[:temperature], Float),
      max_tokens: T.let(permitted[:max_tokens], Integer)
    )), String)
  end

  private
    sig { returns(T::Hash[Symbol, T.untyped]) }
    def permitted_params
      action_params = T.cast(params.require(:params), ActionController::Parameters)
      action_params.permit(:question, :model, :temperature, :max_tokens).to_h
    end
end
