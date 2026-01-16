# frozen_string_literal: true

module Domain
  module Services
    # Validates package configurations against business rules
    class ValidationService
      ValidationResult = Struct.new(:valid?, :errors, :warnings, keyword_init: true)
      ValidationError = Struct.new(:type, :service_id, :message, :required_service_id, keyword_init: true)

      def initialize(services_by_id)
        @services_by_id = services_by_id
      end

      # Validates a complete package configuration
      # Returns ValidationResult with errors and warnings
      def validate(service_ids)
        errors = []
        warnings = []

        errors.concat(validate_dependencies(service_ids))
        errors.concat(validate_conflicts(service_ids))
        warnings.concat(check_recommendations(service_ids))

        ValidationResult.new(
          valid?: errors.empty?,
          errors: errors.map(&:to_h),
          warnings: warnings
        )
      end

      # Check if a specific service can be added to the current package
      def can_add_service?(current_service_ids, service_id_to_add)
        service = @services_by_id[service_id_to_add]
        return { allowed: false, reason: "Service not found: #{service_id_to_add}" } unless service

        # Check if already in package
        if current_service_ids.include?(service_id_to_add)
          return { allowed: false, reason: "#{service.name} is already in the package" }
        end

        # Check dependencies
        missing_deps = service.dependencies.reject { |dep_id| current_service_ids.include?(dep_id) }
        unless missing_deps.empty?
          dep_names = missing_deps.map { |id| @services_by_id[id]&.name || id }.join(', ')
          return {
            allowed: false,
            reason: "#{service.name} requires #{dep_names} to be added first",
            missing_dependencies: missing_deps
          }
        end

        # Check conflicts
        conflicts = service.conflicts.select { |conflict_id| current_service_ids.include?(conflict_id) }
        unless conflicts.empty?
          conflict_names = conflicts.map { |id| @services_by_id[id]&.name || id }.join(', ')
          return {
            allowed: false,
            reason: "#{service.name} conflicts with #{conflict_names}",
            conflicting_services: conflicts
          }
        end

        { allowed: true }
      end

      # Check if a service can be removed (considering dependent services)
      def can_remove_service?(current_service_ids, service_id_to_remove)
        dependent_services = find_dependent_services(current_service_ids, service_id_to_remove)

        if dependent_services.empty?
          { allowed: true, cascade_remove: [] }
        else
          dep_names = dependent_services.map { |id| @services_by_id[id]&.name || id }
          {
            allowed: true,
            cascade_remove: dependent_services,
            warning: "Removing this service will also remove: #{dep_names.join(', ')}"
          }
        end
      end

      private

      def validate_dependencies(service_ids)
        errors = []

        service_ids.each do |service_id|
          service = @services_by_id[service_id]
          next unless service

          service.dependencies.each do |required_id|
            unless service_ids.include?(required_id)
              required_service = @services_by_id[required_id]
              errors << ValidationError.new(
                type: 'missing_dependency',
                service_id: service_id,
                message: "#{service.name} requires #{required_service&.name || required_id}",
                required_service_id: required_id
              )
            end
          end
        end

        errors
      end

      def validate_conflicts(service_ids)
        errors = []
        checked_pairs = Set.new

        service_ids.each do |service_id|
          service = @services_by_id[service_id]
          next unless service

          service.conflicts.each do |conflict_id|
            next unless service_ids.include?(conflict_id)

            # Avoid duplicate errors for the same conflict pair
            pair = [service_id, conflict_id].sort
            next if checked_pairs.include?(pair)

            checked_pairs.add(pair)

            conflicting_service = @services_by_id[conflict_id]
            errors << ValidationError.new(
              type: 'conflict',
              service_id: service_id,
              message: "#{service.name} conflicts with #{conflicting_service&.name || conflict_id}",
              required_service_id: conflict_id
            )
          end
        end

        errors
      end

      def check_recommendations(service_ids)
        warnings = []

        # Check if user has county/federal without full criminal bundle
        criminal_ids = %w[state_criminal county_criminal federal_criminal national_criminal]
        selected_criminal = service_ids & criminal_ids

        if selected_criminal.length >= 2 && selected_criminal.length < 4
          missing = criminal_ids - selected_criminal
          if missing.any?
            warnings << "Add #{missing.length} more criminal search(es) to get the Criminal Bundle discount ($20 off)"
          end
        end

        # Check verification bundle
        verification_ids = %w[employment_verification education_verification professional_license]
        selected_verification = service_ids & verification_ids

        if selected_verification.length >= 1 && selected_verification.length < 3
          missing = verification_ids - selected_verification
          if missing.any?
            warnings << "Add #{missing.length} more verification service(s) to get the Verification Bundle discount ($15 off)"
          end
        end

        warnings
      end

      def find_dependent_services(current_service_ids, service_id_to_remove)
        dependent = []

        current_service_ids.each do |sid|
          next if sid == service_id_to_remove

          service = @services_by_id[sid]
          next unless service

          if service.dependencies.include?(service_id_to_remove)
            dependent << sid
            # Recursively find services that depend on this one
            dependent.concat(find_dependent_services(current_service_ids, sid))
          end
        end

        dependent.uniq
      end
    end
  end
end
