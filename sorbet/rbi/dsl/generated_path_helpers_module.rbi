# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GeneratedPathHelpersModule`.
# Please instead update this file by running `bin/tapioca dsl GeneratedPathHelpersModule`.


module GeneratedPathHelpersModule
  include ::ActionDispatch::Routing::UrlFor
  include ::ActionDispatch::Routing::PolymorphicRoutes

  sig { params(args: T.untyped).returns(String) }
  def rails_health_check_path(*args); end

  sig { params(args: T.untyped).returns(String) }
  def rails_info_notes_path(*args); end

  sig { params(args: T.untyped).returns(String) }
  def rails_info_path(*args); end

  sig { params(args: T.untyped).returns(String) }
  def rails_info_properties_path(*args); end

  sig { params(args: T.untyped).returns(String) }
  def rails_info_routes_path(*args); end

  sig { params(args: T.untyped).returns(String) }
  def turbo_recede_historical_location_path(*args); end

  sig { params(args: T.untyped).returns(String) }
  def turbo_refresh_historical_location_path(*args); end

  sig { params(args: T.untyped).returns(String) }
  def turbo_resume_historical_location_path(*args); end
end
