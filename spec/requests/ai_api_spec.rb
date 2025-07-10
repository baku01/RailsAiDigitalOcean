require 'rails_helper'

RSpec.describe "AiApis", type: :request do
  describe "GET /list_models" do
    it "returns http success" do
      get "/ai_api/list_models"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /answer" do
    it "returns http success" do
      get "/ai_api/answer"
      expect(response).to have_http_status(:success)
    end
  end

end
