import countryToS3Endpoint from '../config/countryToS3Endpoints.json';
import { getHumanReadableRegionName } from './regionNames';

/**
 * Determines the closest S3 endpoint based on the user's country code
 * Uses Cloudflare's CF_IPCOUNTRY header or falls back to Romania (RO) if not available
 * 
 * @param headers Request headers that may contain CF_IPCOUNTRY
 * @returns The appropriate S3 endpoint URL for the user's region
 */
export function getClosestS3Endpoint(headers?: Headers): string {
  // Default to Romania if no headers provided
  if (!headers) {
    return countryToS3Endpoint.RO;
  }

  // Get country code from Cloudflare header or default to RO
  const countryCode = headers.get('HTTP_CF_IPCOUNTRY') || 'RO';
  
  // Get the endpoint for the country code or default to Romania's endpoint
  const endpoint = countryToS3Endpoint[countryCode as keyof typeof countryToS3Endpoint] || countryToS3Endpoint.RO;
  
  return endpoint;
}

/**
 * Extracts the region from an S3 endpoint URL
 * Example: "s3.eu-central-1.amazonaws.com" -> "eu-central-1"
 * 
 * @param endpoint The S3 endpoint URL
 * @returns The AWS region part of the endpoint
 */
export function getRegionFromEndpoint(endpoint: string): string {
  // Extract the region part from the endpoint URL
  const matches = endpoint.match(/s3\.([a-z0-9-]+)\.amazonaws\.com/);
  if (matches && matches[1]) {
    return matches[1];
  }
  
  // Default to eu-central-1 (Romania's region) if parsing fails
  return 'eu-central-1';
}

/**
 * Gets the closest AWS region based on the user's location
 * 
 * @param headers Request headers that may contain CF_IPCOUNTRY
 * @returns The AWS region code (e.g., 'eu-central-1')
 */
export function getClosestS3Region(headers?: Headers): string {
  const endpoint = getClosestS3Endpoint(headers);
  return getRegionFromEndpoint(endpoint);
}

/**
 * Gets the human-readable name of the closest AWS region based on the user's location
 * 
 * @param headers Request headers that may contain CF_IPCOUNTRY
 * @returns Human-readable region name (e.g., 'Europe (Frankfurt)')
 */
export function getHumanReadableS3Region(headers?: Headers): string {
  const regionCode = getClosestS3Region(headers);
  return getHumanReadableRegionName(regionCode);
}
