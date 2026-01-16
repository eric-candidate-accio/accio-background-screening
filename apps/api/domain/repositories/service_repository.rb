# frozen_string_literal: true

module Domain
  module Repositories
    # Abstract interface for service data access
    # Implementations must provide all methods defined here
    class ServiceRepository
      # Returns all services
      # @return [Array<Domain::Entities::Service>]
      def all
        raise NotImplementedError, "#{self.class} must implement #all"
      end

      # Finds a service by ID
      # @param id [String] Service ID
      # @return [Domain::Entities::Service, nil]
      def find(id)
        raise NotImplementedError, "#{self.class} must implement #find"
      end

      # Finds multiple services by IDs
      # @param ids [Array<String>] Service IDs
      # @return [Array<Domain::Entities::Service>]
      def find_by_ids(ids)
        raise NotImplementedError, "#{self.class} must implement #find_by_ids"
      end

      # Returns all services indexed by ID
      # @return [Hash<String, Domain::Entities::Service>]
      def all_by_id
        raise NotImplementedError, "#{self.class} must implement #all_by_id"
      end

      # Returns services grouped by category
      # @return [Hash<String, Array<Domain::Entities::Service>>]
      def by_category
        raise NotImplementedError, "#{self.class} must implement #by_category"
      end

      # Reloads service data from source
      # @return [void]
      def reload!
        raise NotImplementedError, "#{self.class} must implement #reload!"
      end
    end
  end
end
