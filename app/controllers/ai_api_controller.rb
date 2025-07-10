# typed: true

require "sorbet-runtime"

class AiApiController < ApplicationController
  extend T::Sig

  skip_before_action :verify_authenticity_token

  sig { void }
  def initialize
    @api_handler = T.let(AiApiService.new, AiApiService)
  end

  sig { returns(T.nilable(String)) }
  def list_models
    response = T.let(@api_handler.list_models, HTTParty::Response)
    ApiFormatter.parse_to_string(text: response)
  end

  sig { returns(HTTParty::Response) }
  def answer
    @api_handler.answer(
      question: ApiFormatter.
        parse_to_string(text: T.let(answer_params[:question], T.any(String, NilClass))),
      model: ApiFormatter.
        parse_to_string(text: T.let(answer_params[:model], T.any(String, NilClass))),
      temperature: ApiFormatter.
        parse_to_float(value: T.let(answer_params[:temperature], T.any(String, NilClass))),
      max_tokens: ApiFormatter.
        parse_to_int(value: T.let(answer_params[:max_tokens], T.any(String, NilClass)))
    )
  end


  sig { returns(ActionController::Parameters) }
  def answer_params
    params.permit(:question, :model, :temperature, :max_tokens)
  end
end
