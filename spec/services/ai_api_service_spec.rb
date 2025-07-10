# typed: false

require 'rails_helper'
require 'sorbet-runtime'

RSpec.describe AiApiService, type: :service do
  describe '#list_models' do
    it 'retorna uma lista de modelos da API' do
      api_handler = AiApiService.new
      response = api_handler.list_models
      expect(HTTParty::Response)
    end
  end
end
