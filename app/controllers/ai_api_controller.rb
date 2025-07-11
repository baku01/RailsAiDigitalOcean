# typed: true

require "sorbet-runtime"

class AiApiController < ApplicationController
  extend T::Sig

  skip_before_action :verify_authenticity_token

  sig { void }
  def initialize
    @api_handler = T.let(AiApiService.new, AiApiService)
  end

  # app/controllers/ai_api_controller.rb
  sig { void }
  def list_models
    begin
      response = @api_handler.list_models
      available_models = ApiFormatter.extract_model_names(response: response)

      render json: { success: true, models: available_models }
    rescue => e
      Rails.logger.error "Error fetching models: #{e.message}"

      # Fallback para modelos padrão se a API falhar
      fallback_models = [
        { "id" => "meta-llama/Meta-Llama-3.1-8B-Instruct", "name" => "Llama 3.1 8B" },
        { "id" => "meta-llama/Meta-Llama-3.1-70B-Instruct", "name" => "Llama 3.1 70B" },
        { "id" => "mistralai/Mistral-7B-Instruct-v0.3", "name" => "Mistral 7B" }
      ]

      render json: { success: false, models: fallback_models, error: "Could not fetch models from API" }
    end
  end

  sig { void }
  def answer
    begin
      # Para GET requests, renderizar template sem modelos (serão carregados via JS)
      if request.get?
        return render :answer
      end

      # Validar parâmetros obrigatórios
      question_text = answer_params[:question]&.presence
      raise "Question is required" unless question_text

      # Obter modelo padrão dinamicamente
      default_model = get_default_model

      raw_response = @api_handler.answer(
        question: ApiFormatter.parse_to_string(text: question_text),
        model: ApiFormatter.parse_to_string(text: answer_params[:model]&.presence || default_model),
        temperature: ApiFormatter.parse_to_float(value: answer_params[:temperature]&.presence || "0.7"),
        max_tokens: ApiFormatter.parse_to_int(value: answer_params[:max_tokens]&.presence || "1000")
      )

      # Extrair apenas o conteúdo da resposta (texto bruto)
      clean_response = ApiFormatter.extract_ai_response_content(response: raw_response)

      render json: { success: true, answer: clean_response }

    end
  end

  private

  sig { returns(String) }
  def get_default_model
    begin
      response = @api_handler.list_models
      models = ApiFormatter.extract_model_names(response: response)
      models.first&.dig("id") || "meta-llama/Meta-Llama-3.1-8B-Instruct"
    rescue
      "meta-llama/Meta-Llama-3.1-8B-Instruct"
    end
  end

  sig { returns(ActionController::Parameters) }
  def answer_params
    params.permit(:question, :model, :temperature, :max_tokens)
  end
end
