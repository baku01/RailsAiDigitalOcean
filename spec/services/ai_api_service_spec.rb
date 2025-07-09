# frozen_string_literal: true
# typed: false

require 'rails_helper'

RSpec.describe AiApiService, type: :service do
  context 'Quando chamar api' do
    # Validar se possi algo que só vem na resposta (include(#something))

    before do
      @api_service = AiApiService
    end

    it 'listar modelos' do
      model_list = @api_service.list_models
      expect(model_list).to include(:id)
    end
  end
end
