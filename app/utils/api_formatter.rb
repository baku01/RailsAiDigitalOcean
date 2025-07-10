# typed: strict

module ApiFormatter
  class << self
    extend T::Sig
    sig { params(text: T.any(String, T.untyped)).returns(String) }
    def parse_to_string(text:)
      T.let(text, String).to_s
    end
  end
end
