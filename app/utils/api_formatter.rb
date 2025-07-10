# typed: strict

module ApiFormatter
  class << self
    extend T::Sig

    sig { params(text: T.nilable(T.any(String, NilClass, HTTParty::Response))).returns(String) }
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
  end
end
