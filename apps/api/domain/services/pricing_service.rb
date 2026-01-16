# frozen_string_literal: true

module Domain
  module Services
    # Calculates pricing with volume and bundle discounts
    class PricingService
      VOLUME_DISCOUNT_THRESHOLDS = [
        { min_services: 8, discount_percent: 15 },
        { min_services: 5, discount_percent: 10 }
      ].freeze

      CRIMINAL_BUNDLE_IDS = %w[state_criminal county_criminal federal_criminal national_criminal].freeze
      CRIMINAL_BUNDLE_DISCOUNT = 20.00

      VERIFICATION_BUNDLE_IDS = %w[employment_verification education_verification professional_license].freeze
      VERIFICATION_BUNDLE_DISCOUNT = 15.00

      PricingResult = Struct.new(
        :subtotal,
        :discounts,
        :total_discount,
        :total,
        :service_count,
        keyword_init: true
      )

      Discount = Struct.new(:type, :name, :amount, keyword_init: true)

      def initialize(services_by_id)
        @services_by_id = services_by_id
      end

      # Calculate full pricing breakdown for a set of service IDs
      def calculate(service_ids)
        services = service_ids.map { |id| @services_by_id[id] }.compact
        subtotal = calculate_subtotal(services)
        discounts = calculate_discounts(service_ids, subtotal)
        total_discount = discounts.sum { |d| d[:amount] }
        total = [subtotal - total_discount, 0].max

        PricingResult.new(
          subtotal: round_currency(subtotal),
          discounts: discounts,
          total_discount: round_currency(total_discount),
          total: round_currency(total),
          service_count: services.length
        ).to_h
      end

      # Get itemized service prices
      def itemize(service_ids)
        service_ids.map do |id|
          service = @services_by_id[id]
          next unless service

          {
            id: service.id,
            name: service.name,
            price: service.base_price
          }
        end.compact
      end

      private

      def calculate_subtotal(services)
        services.sum(&:base_price)
      end

      def calculate_discounts(service_ids, subtotal)
        discounts = []

        # Volume discount (only one applies - the highest tier)
        volume_discount = calculate_volume_discount(service_ids.length, subtotal)
        discounts << volume_discount if volume_discount

        # Bundle discounts (these stack)
        criminal_bundle = calculate_criminal_bundle_discount(service_ids)
        discounts << criminal_bundle if criminal_bundle

        verification_bundle = calculate_verification_bundle_discount(service_ids)
        discounts << verification_bundle if verification_bundle

        discounts.map(&:to_h)
      end

      def calculate_volume_discount(service_count, subtotal)
        threshold = VOLUME_DISCOUNT_THRESHOLDS.find { |t| service_count >= t[:min_services] }
        return nil unless threshold

        discount_amount = subtotal * (threshold[:discount_percent] / 100.0)

        Discount.new(
          type: 'volume',
          name: "Volume Discount (#{threshold[:discount_percent]}% for #{threshold[:min_services]}+ services)",
          amount: round_currency(discount_amount)
        )
      end

      def calculate_criminal_bundle_discount(service_ids)
        has_all_criminal = CRIMINAL_BUNDLE_IDS.all? { |id| service_ids.include?(id) }
        return nil unless has_all_criminal

        Discount.new(
          type: 'bundle',
          name: 'Criminal Bundle Discount (all 4 criminal searches)',
          amount: CRIMINAL_BUNDLE_DISCOUNT
        )
      end

      def calculate_verification_bundle_discount(service_ids)
        has_all_verification = VERIFICATION_BUNDLE_IDS.all? { |id| service_ids.include?(id) }
        return nil unless has_all_verification

        Discount.new(
          type: 'bundle',
          name: 'Verification Bundle Discount (all 3 verification services)',
          amount: VERIFICATION_BUNDLE_DISCOUNT
        )
      end

      def round_currency(amount)
        (amount * 100).round / 100.0
      end
    end
  end
end
