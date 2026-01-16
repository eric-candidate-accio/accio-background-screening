# frozen_string_literal: true

module Domain
  module Entities
    # Service entity representing a background screening service
    class Service
      attr_reader :id, :name, :base_price, :category, :dependencies, :conflicts

      def initialize(id:, name:, base_price:, category:, dependencies: [], conflicts: [])
        @id = id
        @name = name
        @base_price = base_price.to_f
        @category = category
        @dependencies = dependencies
        @conflicts = conflicts
      end

      def criminal?
        category == 'criminal'
      end

      def verification?
        category == 'verification'
      end

      def has_dependency?(service_id)
        dependencies.include?(service_id)
      end

      def conflicts_with?(service_id)
        conflicts.include?(service_id)
      end

      def to_h
        {
          id: id,
          name: name,
          base_price: base_price,
          category: category,
          dependencies: dependencies,
          conflicts: conflicts
        }
      end

      def self.from_hash(hash)
        new(
          id: hash['id'] || hash[:id],
          name: hash['name'] || hash[:name],
          base_price: hash['base_price'] || hash[:base_price],
          category: hash['category'] || hash[:category],
          dependencies: hash['dependencies'] || hash[:dependencies] || [],
          conflicts: hash['conflicts'] || hash[:conflicts] || []
        )
      end
    end
  end
end
