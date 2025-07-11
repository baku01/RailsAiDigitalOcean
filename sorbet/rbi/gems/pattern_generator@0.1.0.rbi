# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `pattern_generator` gem.
# Please instead update this file by running `bin/tapioca gem pattern_generator`.


# Base class for all generators to come. If you want to override some behaviour, all you
# got to do is override a method in the child class.
#
# source://pattern_generator//lib/generators/base_generator.rb#5
class BaseGenerator < ::Rails::Generators::NamedBase
  # Creates the file for the requested pattern based on a template file.
  #
  # source://pattern_generator//lib/generators/base_generator.rb#11
  def copy_pattern_file; end

  # Creates the test file for the request pattern based on a template file.
  #
  # source://pattern_generator//lib/generators/base_generator.rb#16
  def copy_pattern_test_file; end

  private

  # Determines the class name based on the file name given by the user.
  #
  # source://pattern_generator//lib/generators/base_generator.rb#23
  def class_name; end

  # source://pattern_generator//lib/generators/base_generator.rb#32
  def folder_name; end

  # Generates the file path.
  # Ex: app/services/authentication.rb
  #
  # source://pattern_generator//lib/generators/base_generator.rb#44
  def generated_file_path; end

  # Generates the test file path.
  # Ex: spec/services/authentication_spec.rb
  #
  # source://pattern_generator//lib/generators/base_generator.rb#56
  def generated_test_file_path; end

  # This method must be overrided in the child classes.
  #
  # @raise [NotImplementedError]
  #
  # source://pattern_generator//lib/generators/base_generator.rb#28
  def pattern_name; end

  # Generates the pattern suffix.
  # Ex: _service
  #
  # source://pattern_generator//lib/generators/base_generator.rb#38
  def suffix; end

  # source://pattern_generator//lib/generators/base_generator.rb#48
  def test_suite_identifier; end
end

# source://pattern_generator//lib/generators/form/form_generator.rb#1
class FormGenerator < ::BaseGenerator
  private

  # source://pattern_generator//lib/generators/form/form_generator.rb#6
  def pattern_name; end
end

# source://pattern_generator//lib/pattern_generator.rb#9
module PatternGenerator; end

# source://pattern_generator//lib/generators/policy/policy_generator.rb#1
class PolicyGenerator < ::BaseGenerator
  private

  # source://pattern_generator//lib/generators/policy/policy_generator.rb#6
  def pattern_name; end
end

# source://pattern_generator//lib/generators/poro/poro_generator.rb#1
class PoroGenerator < ::BaseGenerator
  private

  # source://pattern_generator//lib/generators/poro/poro_generator.rb#6
  def folder_name; end

  # source://pattern_generator//lib/generators/poro/poro_generator.rb#10
  def pattern_name; end

  # source://pattern_generator//lib/generators/poro/poro_generator.rb#14
  def suffix; end
end

# source://pattern_generator//lib/generators/service/service_generator.rb#1
class ServiceGenerator < ::BaseGenerator
  private

  # source://pattern_generator//lib/generators/service/service_generator.rb#6
  def pattern_name; end
end
