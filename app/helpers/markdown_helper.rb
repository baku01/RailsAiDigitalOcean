# typed: false

require "redcarpet"

module MarkdownHelper
  extend T::Sig

  sig { params(text: String).returns(String) }
  def self.render_markdown(text:)
    # Configurar o renderer com opções otimizadas
    renderer = Redcarpet::Render::HTML.new(
      filter_html: true,
      no_images: false,
      no_links: false,
      no_styles: true,
      safe_links_only: true,
      with_toc_data: false,
      hard_wrap: true,
      escape_html: false
    )

    # Configurar o markdown processor
    markdown = Redcarpet::Markdown.new(renderer,
      autolink: true,
      tables: true,
      fenced_code_blocks: true,
      strikethrough: true,
      superscript: true,
      underline: true,
      highlight: true,
      quote: true,
      footnotes: true
    )

    markdown.render(text)
  end
end
