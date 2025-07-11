# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `importmap-rails` gem.
# Please instead update this file by running `bin/tapioca gem importmap-rails`.


# source://importmap-rails//lib/importmap-rails.rb#1
module Importmap; end

# source://importmap-rails//lib/importmap/engine.rb#7
class Importmap::Engine < ::Rails::Engine; end

module Importmap::Freshness
  def stale_when_importmap_changes; end
end

module Importmap::ImportmapTagsHelper
  def javascript_import_module_tag(*module_names); end
  def javascript_importmap_module_preload_tags(importmap = T.unsafe(nil), entry_point: T.unsafe(nil)); end
  def javascript_importmap_tags(entry_point = T.unsafe(nil), importmap: T.unsafe(nil)); end
  def javascript_inline_importmap_tag(importmap_json = T.unsafe(nil)); end
  def javascript_module_preload_tag(*paths); end
end

# source://importmap-rails//lib/importmap/map.rb#3
class Importmap::Map
  # @return [Map] a new instance of Map
  #
  # source://importmap-rails//lib/importmap/map.rb#8
  def initialize; end

  # Returns an instance of ActiveSupport::EventedFileUpdateChecker configured to clear the cache of the map
  # when the directories passed on initialization via `watches:` have changes. This is used in development
  # and test to ensure the map caches are reset when javascript files are changed.
  #
  # source://importmap-rails//lib/importmap/map.rb#75
  def cache_sweeper(watches: T.unsafe(nil)); end

  # Returns a SHA1 digest of the import map json that can be used as a part of a page etag to
  # ensure that a html cache is invalidated when the import map is changed.
  #
  # Example:
  #
  #   class ApplicationController < ActionController::Base
  #     etag { Rails.application.importmap.digest(resolver: helpers) if request.format&.html? }
  #   end
  #
  # source://importmap-rails//lib/importmap/map.rb#68
  def digest(resolver:); end

  # Returns the value of attribute directories.
  #
  # source://importmap-rails//lib/importmap/map.rb#4
  def directories; end

  # source://importmap-rails//lib/importmap/map.rb#13
  def draw(path = T.unsafe(nil), &block); end

  # Returns the value of attribute packages.
  #
  # source://importmap-rails//lib/importmap/map.rb#4
  def packages; end

  # source://importmap-rails//lib/importmap/map.rb#28
  def pin(name, to: T.unsafe(nil), preload: T.unsafe(nil)); end

  # source://importmap-rails//lib/importmap/map.rb#33
  def pin_all_from(dir, under: T.unsafe(nil), to: T.unsafe(nil), preload: T.unsafe(nil)); end

  # Returns an array of all the resolved module paths of the pinned packages. The `resolver` must respond to
  # `path_to_asset`, such as `ActionController::Base.helpers` or `ApplicationController.helpers`. You'll want to use the
  # resolver that has been configured for the `asset_host` you want these resolved paths to use. In case you need to
  # resolve for different asset hosts, you can pass in a custom `cache_key` to vary the cache used by this method for
  # the different cases.
  #
  # source://importmap-rails//lib/importmap/map.rb#43
  def preloaded_module_paths(resolver:, entry_point: T.unsafe(nil), cache_key: T.unsafe(nil)); end

  # Returns a JSON hash (as a string) of all the resolved module paths of the pinned packages in the import map format.
  # The `resolver` must respond to `path_to_asset`, such as `ActionController::Base.helpers` or
  # `ApplicationController.helpers`. You'll want to use the resolver that has been configured for the `asset_host` you
  # want these resolved paths to use. In case you need to resolve for different asset hosts, you can pass in a custom
  # `cache_key` to vary the cache used by this method for the different cases.
  #
  # source://importmap-rails//lib/importmap/map.rb#54
  def to_json(resolver:, cache_key: T.unsafe(nil)); end

  private

  # source://importmap-rails//lib/importmap/map.rb#165
  def absolute_root_of(path); end

  # source://importmap-rails//lib/importmap/map.rb#90
  def cache_as(name); end

  # source://importmap-rails//lib/importmap/map.rb#98
  def clear_cache; end

  # source://importmap-rails//lib/importmap/map.rb#129
  def expand_directories_into(paths); end

  # source://importmap-rails//lib/importmap/map.rb#125
  def expanded_packages_and_directories; end

  # source://importmap-rails//lib/importmap/map.rb#121
  def expanded_preloading_packages_and_directories(entry_point:); end

  # source://importmap-rails//lib/importmap/map.rb#161
  def find_javascript_files_in_tree(path); end

  # source://importmap-rails//lib/importmap/map.rb#143
  def module_name_from(filename, mapping); end

  # source://importmap-rails//lib/importmap/map.rb#157
  def module_path_from(filename, mapping); end

  # @return [Boolean]
  #
  # source://importmap-rails//lib/importmap/map.rb#102
  def rescuable_asset_error?(error); end

  # source://importmap-rails//lib/importmap/map.rb#106
  def resolve_asset_paths(paths, resolver:); end
end

# source://importmap-rails//lib/importmap/map.rb#6
class Importmap::Map::InvalidFile < ::StandardError; end

# source://importmap-rails//lib/importmap/map.rb#87
class Importmap::Map::MappedDir < ::Struct
  # Returns the value of attribute dir
  #
  # @return [Object] the current value of dir
  #
  # source://importmap-rails//lib/importmap/map.rb#87
  def dir; end

  # Sets the attribute dir
  #
  # @param value [Object] the value to set the attribute dir to.
  # @return [Object] the newly set value
  #
  # source://importmap-rails//lib/importmap/map.rb#87
  def dir=(_); end

  # Returns the value of attribute path
  #
  # @return [Object] the current value of path
  #
  # source://importmap-rails//lib/importmap/map.rb#87
  def path; end

  # Sets the attribute path
  #
  # @param value [Object] the value to set the attribute path to.
  # @return [Object] the newly set value
  #
  # source://importmap-rails//lib/importmap/map.rb#87
  def path=(_); end

  # Returns the value of attribute preload
  #
  # @return [Object] the current value of preload
  #
  # source://importmap-rails//lib/importmap/map.rb#87
  def preload; end

  # Sets the attribute preload
  #
  # @param value [Object] the value to set the attribute preload to.
  # @return [Object] the newly set value
  #
  # source://importmap-rails//lib/importmap/map.rb#87
  def preload=(_); end

  # Returns the value of attribute under
  #
  # @return [Object] the current value of under
  #
  # source://importmap-rails//lib/importmap/map.rb#87
  def under; end

  # Sets the attribute under
  #
  # @param value [Object] the value to set the attribute under to.
  # @return [Object] the newly set value
  #
  # source://importmap-rails//lib/importmap/map.rb#87
  def under=(_); end

  class << self
    # source://importmap-rails//lib/importmap/map.rb#87
    def [](*_arg0); end

    # source://importmap-rails//lib/importmap/map.rb#87
    def inspect; end

    # source://importmap-rails//lib/importmap/map.rb#87
    def keyword_init?; end

    # source://importmap-rails//lib/importmap/map.rb#87
    def members; end

    # source://importmap-rails//lib/importmap/map.rb#87
    def new(*_arg0); end
  end
end

# source://importmap-rails//lib/importmap/map.rb#88
class Importmap::Map::MappedFile < ::Struct
  # Returns the value of attribute name
  #
  # @return [Object] the current value of name
  #
  # source://importmap-rails//lib/importmap/map.rb#88
  def name; end

  # Sets the attribute name
  #
  # @param value [Object] the value to set the attribute name to.
  # @return [Object] the newly set value
  #
  # source://importmap-rails//lib/importmap/map.rb#88
  def name=(_); end

  # Returns the value of attribute path
  #
  # @return [Object] the current value of path
  #
  # source://importmap-rails//lib/importmap/map.rb#88
  def path; end

  # Sets the attribute path
  #
  # @param value [Object] the value to set the attribute path to.
  # @return [Object] the newly set value
  #
  # source://importmap-rails//lib/importmap/map.rb#88
  def path=(_); end

  # Returns the value of attribute preload
  #
  # @return [Object] the current value of preload
  #
  # source://importmap-rails//lib/importmap/map.rb#88
  def preload; end

  # Sets the attribute preload
  #
  # @param value [Object] the value to set the attribute preload to.
  # @return [Object] the newly set value
  #
  # source://importmap-rails//lib/importmap/map.rb#88
  def preload=(_); end

  class << self
    # source://importmap-rails//lib/importmap/map.rb#88
    def [](*_arg0); end

    # source://importmap-rails//lib/importmap/map.rb#88
    def inspect; end

    # source://importmap-rails//lib/importmap/map.rb#88
    def keyword_init?; end

    # source://importmap-rails//lib/importmap/map.rb#88
    def members; end

    # source://importmap-rails//lib/importmap/map.rb#88
    def new(*_arg0); end
  end
end

# source://importmap-rails//lib/importmap/reloader.rb#4
class Importmap::Reloader
  # source://importmap-rails//lib/importmap/reloader.rb#5
  def execute(*_arg0, **_arg1, &_arg2); end

  # source://importmap-rails//lib/importmap/reloader.rb#5
  def execute_if_updated(*_arg0, **_arg1, &_arg2); end

  # source://importmap-rails//lib/importmap/reloader.rb#7
  def reload!; end

  # source://importmap-rails//lib/importmap/reloader.rb#5
  def updated?(*_arg0, **_arg1, &_arg2); end

  private

  # source://importmap-rails//lib/importmap/reloader.rb#20
  def config; end

  # source://importmap-rails//lib/importmap/reloader.rb#16
  def import_map_paths; end

  # source://importmap-rails//lib/importmap/reloader.rb#12
  def updater; end
end

# source://importmap-rails//lib/importmap/version.rb#2
Importmap::VERSION = T.let(T.unsafe(nil), String)
