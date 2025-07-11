# typed: false

module ApiFormatter
  extend T::Sig

  class << self
    extend T::Sig

    sig { params(response: String).returns(T::Hash[String, T.untyped]) }
    def parse_api_response(response:)
      T.let(JSON.parse(response), T::Hash[String, T.untyped])
    end

    sig { params(text: T.any(HTTParty::Response, String)).returns(String) }
    def parse_to_string(text:)
      T.let(text.to_s, String)
    end

    sig { params(value: T.nilable(String)).returns(Integer) }
    def parse_to_int(value:)
      T.let(value.to_i, Integer)
    end

    sig { params(value: T.nilable(String)).returns(Float) }
    def parse_to_float(value:)
      T.let(value.to_f, Float)
    end

    sig { params(response: T.any(String, T::Hash[String, T.untyped])).returns(T::Array[T::Hash[String, String]]) }
    def extract_model_names(response:)
      json_data = T.let(JSON.parse(response.to_s), T::Hash[String, T.untyped])
      models_array = T.cast(json_data["data"], T::Array[T::Hash[String, T.untyped]])

      models_array.map do |model|
        {
          "id" => model["id"].to_s,
          "name" => model["name"]&.to_s || model["id"].to_s
        }
      end
    rescue JSON::ParserError => e
      Rails.logger.error "JSON parsing error in extract_model_names: #{e.message}"
      []
    rescue => e
      Rails.logger.error "Error extracting model names: #{e.message}"
      []
    end

    sig { params(response: String).returns(String) }
    def extract_ai_response_content(response:)
      json_data = T.let(JSON.parse(response), T::Hash[String, T.untyped])
      choices = T.cast(json_data["choices"], T::Array[T::Hash[String, T.untyped]])

      # Extrair apenas o conteúdo da primeira escolha (texto bruto)
      first_choice = choices&.first
      return "Resposta vazia da API." unless first_choice

      message = T.cast(first_choice["message"], T.nilable(T::Hash[String, T.untyped]))
      return "Formato de resposta inválido." unless message

      content = message["content"]
      content&.to_s&.strip || "Desculpe, não consegui processar sua solicitação."

    rescue JSON::ParserError => e
      Rails.logger.error "JSON parsing error in extract_ai_response_content: #{e.message}"
      "Erro ao processar resposta da API."
    rescue => e
      Rails.logger.error "Error extracting AI response content: #{e.message}"
      "Erro interno ao processar resposta."
    end

    private

    sig { params(text: String).returns(T::Boolean) }
    def contains_markdown?(text)
      # Verificar se o texto contém elementos de markdown
      markdown_patterns = [
        /```[\s\S]*?```/,  # Code blocks
        /`[^`\n]+`/,       # Inline code
        /\*\*[^*\n]+\*\*/,  # Bold
        /\*[^*\n]+\*/,     # Italic
        /^\#{1,6}\s/,       # Headers
        /^\s*[-*+]\s/,     # Lists
        /^\s*\d+\.\s/,     # Numbered lists
        /\[[^\]]*\]\([^)]*\)/, # Links
        /^\s*>\s/          # Blockquotes
      ]

      markdown_patterns.any? { |pattern| text.match?(pattern) }
    end
  end
end
