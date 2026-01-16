# frozen_string_literal: true

module Domain
  module Repositories
    # Abstract interface for package persistence
    # Implementations must provide all methods defined here
    class PackageRepository
      # Returns all packages
      # @return [Array<Domain::Entities::Package>]
      def all
        raise NotImplementedError, "#{self.class} must implement #all"
      end

      # Finds a package by ID
      # @param id [String] Package UUID
      # @return [Domain::Entities::Package, nil]
      def find(id)
        raise NotImplementedError, "#{self.class} must implement #find"
      end

      # Finds the most recently updated package
      # @return [Domain::Entities::Package, nil]
      def find_most_recent
        raise NotImplementedError, "#{self.class} must implement #find_most_recent"
      end

      # Creates a new package
      # @param package [Domain::Entities::Package]
      # @return [Domain::Entities::Package]
      def create(package)
        raise NotImplementedError, "#{self.class} must implement #create"
      end

      # Updates an existing package
      # @param package [Domain::Entities::Package]
      # @return [Domain::Entities::Package, nil]
      def update(package)
        raise NotImplementedError, "#{self.class} must implement #update"
      end

      # Deletes a package by ID
      # @param id [String] Package UUID
      # @return [Boolean] true if deleted, false if not found
      def delete(id)
        raise NotImplementedError, "#{self.class} must implement #delete"
      end

      # Checks if a package exists
      # @param id [String] Package UUID
      # @return [Boolean]
      def exists?(id)
        raise NotImplementedError, "#{self.class} must implement #exists?"
      end
    end
  end
end
