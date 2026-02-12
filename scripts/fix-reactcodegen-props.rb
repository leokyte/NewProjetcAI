#!/usr/bin/env ruby
require 'xcodeproj'
require 'pathname'

repo_root = File.expand_path('..', __dir__)
project_path = File.join(repo_root, 'ios', 'Pods', 'Pods.xcodeproj')
generated_root = File.join(repo_root, 'ios', 'build', 'generated', 'ios', 'react', 'renderer', 'components')

unless File.exist?(project_path)
  warn "Pods project not found at #{project_path}"
  exit 1
end

unless Dir.exist?(generated_root)
  warn "Generated components folder not found at #{generated_root}"
  exit 1
end

project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |t| t.name == 'ReactCodegen' }

unless target
  warn 'ReactCodegen target not found – aborting'
  exit 1
end

phase = target.source_build_phase
added = []

Dir.glob(File.join(generated_root, '**/Props.cpp')).each do |file_path|
  pathname = Pathname.new(file_path)
  file_ref = project.files.find { |ref| ref.real_path == pathname }
  file_ref ||= project.main_group.new_file(file_path)

  next if phase.files_references.include?(file_ref)

  phase.add_file_reference(file_ref)
  added << file_path
end

project.save

if added.empty?
  puts 'No new Props sources needed - ReactCodegen already references every Props.cpp.'
else
  puts "Added #{added.size} Props source(s):"
  added.each { |path| puts "  - #{path}" }
end
