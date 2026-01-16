# frozen_string_literal: true

require 'json'
require_relative '../../../domain/entities/service'
require_relative '../../../domain/repositories/service_repository'

module Infrastructure
  module Repositories
    module Json
      # JSON file implementation of ServiceRepository
      class JsonServiceRepository < Domain::Repositories::ServiceRepository
        def initialize(config_path)
          @config_path = config_path
          @services_cache = nil
        end

        def all
          load_services
          @services_cache.values
        end

        def find(id)
          load_services
          @services_cache[id]
        end

        def find_by_ids(ids)
          load_services
          ids.map { |id| @services_cache[id] }.compact
        end

        def all_by_id
          load_services
          @services_cache.dup
        end

        def by_category
          load_services
          @services_cache.values.group_by(&:category)
        end

        def reload!
          @services_cache = nil
          load_services
        end

        private

        def load_services
          return if @services_cache

          data = JSON.parse(File.read(@config_path))
          @services_cache = {}

          data['services'].each do |service_data|
            service = Domain::Entities::Service.from_hash(service_data)
            @services_cache[service.id] = service
          end
        end
      end
    end
  end
end
