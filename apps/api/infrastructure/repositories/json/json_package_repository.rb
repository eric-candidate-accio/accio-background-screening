# frozen_string_literal: true

require 'json'
require 'fileutils'
require_relative '../../../domain/entities/package'
require_relative '../../../domain/repositories/package_repository'

module Infrastructure
  module Repositories
    module Json
      # JSON file implementation of PackageRepository
      class JsonPackageRepository < Domain::Repositories::PackageRepository
        def initialize(data_path)
          @data_path = data_path
          ensure_data_file_exists
        end

        def all
          data = load_data
          data['packages'].map { |p| Domain::Entities::Package.from_hash(p) }
        end

        def find(id)
          data = load_data
          package_data = data['packages'].find { |p| p['id'] == id }
          return nil unless package_data

          Domain::Entities::Package.from_hash(package_data)
        end

        def find_most_recent
          packages = all
          return nil if packages.empty?

          packages.max_by { |p| p.updated_at || p.created_at }
        end

        def create(package)
          data = load_data
          data['packages'] << package.to_h.transform_keys(&:to_s)
          save_data(data)
          package
        end

        def update(package)
          data = load_data
          index = data['packages'].find_index { |p| p['id'] == package.id }
          return nil unless index

          data['packages'][index] = package.to_h.transform_keys(&:to_s)
          save_data(data)
          package
        end

        def delete(id)
          data = load_data
          original_count = data['packages'].length
          data['packages'].reject! { |p| p['id'] == id }

          if data['packages'].length < original_count
            save_data(data)
            true
          else
            false
          end
        end

        def exists?(id)
          data = load_data
          data['packages'].any? { |p| p['id'] == id }
        end

        private

        def ensure_data_file_exists
          return if File.exist?(@data_path)

          FileUtils.mkdir_p(File.dirname(@data_path))
          File.write(@data_path, JSON.pretty_generate({ 'packages' => [] }))
        end

        def load_data
          JSON.parse(File.read(@data_path))
        rescue JSON::ParserError, Errno::ENOENT
          { 'packages' => [] }
        end

        def save_data(data)
          File.write(@data_path, JSON.pretty_generate(data))
        end
      end
    end
  end
end
