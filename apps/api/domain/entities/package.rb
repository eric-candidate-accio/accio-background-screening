# frozen_string_literal: true

require 'securerandom'

module Domain
  module Entities
    # Package aggregate root representing a collection of screening services
    class Package
      attr_reader :id, :name, :service_ids, :created_at, :updated_at

      def initialize(id: nil, name:, service_ids: [], created_at: nil, updated_at: nil)
        @id = id || SecureRandom.uuid
        @name = name
        @service_ids = service_ids
        @created_at = created_at || Time.now.iso8601
        @updated_at = updated_at || Time.now.iso8601
      end

      def add_service(service_id)
        return if service_ids.include?(service_id)

        @service_ids << service_id
        touch
      end

      def remove_service(service_id)
        @service_ids.delete(service_id)
        touch
      end

      def has_service?(service_id)
        service_ids.include?(service_id)
      end

      def service_count
        service_ids.length
      end

      def update_name(new_name)
        @name = new_name
        touch
      end

      def update_services(new_service_ids)
        @service_ids = new_service_ids
        touch
      end

      def to_h
        {
          id: id,
          name: name,
          service_ids: service_ids,
          created_at: created_at,
          updated_at: updated_at
        }
      end

      def self.from_hash(hash)
        new(
          id: hash['id'] || hash[:id],
          name: hash['name'] || hash[:name],
          service_ids: hash['service_ids'] || hash[:service_ids] || [],
          created_at: hash['created_at'] || hash[:created_at],
          updated_at: hash['updated_at'] || hash[:updated_at]
        )
      end

      private

      def touch
        @updated_at = Time.now.iso8601
      end
    end
  end
end
