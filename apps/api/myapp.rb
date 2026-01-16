# frozen_string_literal: true

require 'sinatra'
require 'sinatra/json'
require 'sinatra/reloader' if development?
require 'json'
require 'yaml'
require 'rack/cors'

# Load domain layer
require_relative 'domain/entities/service'
require_relative 'domain/entities/package'
require_relative 'domain/services/validation_service'
require_relative 'domain/services/pricing_service'
require_relative 'domain/repositories/service_repository'
require_relative 'domain/repositories/package_repository'

# Load infrastructure layer
require_relative 'infrastructure/repositories/json/json_service_repository'
require_relative 'infrastructure/repositories/json/json_package_repository'

# Configuration
set :port, 4567
set :bind, '0.0.0.0'

# CORS configuration for frontend
use Rack::Cors do
  allow do
    origins '*'
    resource '*', headers: :any, methods: %i[get post put patch delete options head]
  end
end

# Initialize repositories
CONFIG_PATH = File.join(__dir__, 'config', 'services.json')
DATA_PATH = File.join(__dir__, 'data', 'packages.json')
OPENAPI_PATH = File.join(__dir__, 'openapi.yaml')

# Repository instances - swap implementations here to change storage backend
def service_repository
  @service_repository ||= Infrastructure::Repositories::Json::JsonServiceRepository.new(CONFIG_PATH)
end

def package_repository
  @package_repository ||= Infrastructure::Repositories::Json::JsonPackageRepository.new(DATA_PATH)
end

def validation_service
  @validation_service ||= Domain::Services::ValidationService.new(service_repository.all_by_id)
end

def pricing_service
  @pricing_service ||= Domain::Services::PricingService.new(service_repository.all_by_id)
end

# Helper to parse JSON body
def json_body
  request.body.rewind
  body = request.body.read
  return {} if body.empty?

  JSON.parse(body)
rescue JSON::ParserError
  halt 400, json(error: 'Invalid JSON')
end

# Error handling
error do
  json error: env['sinatra.error'].message
end

not_found do
  json error: 'Not found'
end

# ===================
# Health Check
# ===================
get '/' do
  json status: 'ok', service: 'Background Screening API'
end

# ===================
# OpenAPI Spec
# ===================
get '/openapi.yaml' do
  content_type 'application/x-yaml'
  File.read(OPENAPI_PATH)
end

get '/openapi.json' do
  content_type :json
  spec = YAML.safe_load(File.read(OPENAPI_PATH))
  JSON.pretty_generate(spec)
end

# ===================
# Services API
# ===================

# GET /api/services - List all available services
get '/api/services' do
  services = service_repository.all.map(&:to_h)
  services_by_category = service_repository.by_category.transform_values { |v| v.map(&:to_h) }

  json(
    services: services,
    by_category: services_by_category
  )
end

# GET /api/services/:id - Get a specific service
get '/api/services/:id' do
  service = service_repository.find(params[:id])
  halt 404, json(error: "Service not found: #{params[:id]}") unless service

  json service.to_h
end

# POST /api/services/:id/can-add - Check if a service can be added
post '/api/services/:id/can-add' do
  data = json_body
  current_service_ids = data['current_service_ids'] || []

  result = validation_service.can_add_service?(current_service_ids, params[:id])

  json result
end

# POST /api/services/:id/can-remove - Check if a service can be removed
post '/api/services/:id/can-remove' do
  data = json_body
  current_service_ids = data['current_service_ids'] || []

  result = validation_service.can_remove_service?(current_service_ids, params[:id])

  json result
end

# ===================
# Packages API
# ===================

# GET /api/packages - List all saved packages
get '/api/packages' do
  packages = package_repository.all.map do |pkg|
    pricing = pricing_service.calculate(pkg.service_ids)
    pkg.to_h.merge(pricing: pricing)
  end

  json packages: packages
end

# POST /api/packages/validate - Validate a package configuration
post '/api/packages/validate' do
  data = json_body
  service_ids = data['service_ids'] || []

  validation = validation_service.validate(service_ids)

  json validation.to_h
end

# POST /api/packages/price - Calculate pricing for a package
post '/api/packages/price' do
  data = json_body
  service_ids = data['service_ids'] || []

  pricing = pricing_service.calculate(service_ids)
  services = pricing_service.itemize(service_ids)

  json(
    services: services,
    pricing: pricing
  )
end

# GET /api/packages/recent - Get most recently saved package
get '/api/packages/recent' do
  package = package_repository.find_most_recent
  halt 404, json(error: 'No packages found') unless package

  pricing = pricing_service.calculate(package.service_ids)
  validation = validation_service.validate(package.service_ids)
  services = pricing_service.itemize(package.service_ids)

  json(
    package: package.to_h,
    services: services,
    pricing: pricing,
    validation: validation.to_h
  )
end

# GET /api/packages/:id - Get a specific package with pricing
get '/api/packages/:id' do
  package = package_repository.find(params[:id])
  halt 404, json(error: "Package not found: #{params[:id]}") unless package

  pricing = pricing_service.calculate(package.service_ids)
  validation = validation_service.validate(package.service_ids)
  services = pricing_service.itemize(package.service_ids)

  json(
    package: package.to_h,
    services: services,
    pricing: pricing,
    validation: validation.to_h
  )
end

# POST /api/packages - Create a new package
post '/api/packages' do
  data = json_body
  halt 400, json(error: 'Package name is required') unless data['name'] && !data['name'].strip.empty?

  service_ids = data['service_ids'] || []

  # Validate the package configuration
  validation = validation_service.validate(service_ids)
  unless validation.valid?
    halt 422, json(
      error: 'Invalid package configuration',
      validation: validation.to_h
    )
  end

  # Create and save the package
  package = Domain::Entities::Package.new(
    name: data['name'].strip,
    service_ids: service_ids
  )

  package_repository.create(package)
  pricing = pricing_service.calculate(package.service_ids)
  services = pricing_service.itemize(package.service_ids)

  status 201
  json(
    package: package.to_h,
    services: services,
    pricing: pricing,
    validation: validation.to_h
  )
end

# PUT /api/packages/:id - Update an existing package
put '/api/packages/:id' do
  package = package_repository.find(params[:id])
  halt 404, json(error: "Package not found: #{params[:id]}") unless package

  data = json_body

  # Update fields if provided
  package.update_name(data['name'].strip) if data['name'] && !data['name'].strip.empty?
  package.update_services(data['service_ids']) if data.key?('service_ids')

  # Validate the updated configuration
  validation = validation_service.validate(package.service_ids)
  unless validation.valid?
    halt 422, json(
      error: 'Invalid package configuration',
      validation: validation.to_h
    )
  end

  package_repository.update(package)
  pricing = pricing_service.calculate(package.service_ids)
  services = pricing_service.itemize(package.service_ids)

  json(
    package: package.to_h,
    services: services,
    pricing: pricing,
    validation: validation.to_h
  )
end

# DELETE /api/packages/:id - Delete a package
delete '/api/packages/:id' do
  deleted = package_repository.delete(params[:id])
  halt 404, json(error: "Package not found: #{params[:id]}") unless deleted

  status 204
  ''
end
