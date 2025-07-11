# typed: strict
# frozen_string_literal: true

require "sorbet-runtime"

module ApiResponseParser
  class << self
  extend T::Sig
    # Parse API response ensuring it returns an array of hashes
    sig { params(response: T.any(String, HTTParty::Response)).returns(T::Array[T::Hash[Symbol, T.untyped]]) }
    def parse_response(response:)
      # Handle HTTParty::Response
      if response.is_a?(HTTParty::Response)
        return parse_json_string(response: response.body)
      end

      # Handle String response
      parse_json_string(response: response)
    end

    # Parse models from API response
    sig { params(response: T.any(String, HTTParty::Response)).returns(T::Array[String]) }
    def parse_models(response:)
      parsed = parse_response(response: response)

      models = []
      parsed.each do |item|
        # Try different keys that might contain model identifiers
        model_id = item[:id] || item[:name] || item[:model] || item[:model_name] || item[:model_id]
        models << model_id.to_s if model_id
      end

      models.uniq.reject(&:empty?)
    end

    private

    sig { params(response: String).returns(T::Array[T::Hash[Symbol, T.untyped]]) }
    def parse_json_string(response:)
      json = response.strip
      json = "[#{json}]" unless json.start_with?("[")
      T.let(JSON.parse(json, symbolize_names: true), T::Array[T::Hash[Symbol, T.untyped]])
    end
  end
end
