/**
 * Maps AWS region codes to human-readable region names
 */
export const regionToHumanReadableName: Record<string, string> = {
  // North America
  'us-east-1': 'US East (N. Virginia)',
  'us-east-2': 'US East (Ohio)',
  'us-west-1': 'US West (N. California)',
  'us-west-2': 'US West (Oregon)',
  'ca-central-1': 'Canada (Central)',
  
  // South America
  'sa-east-1': 'South America (São Paulo)',
  
  // Europe
  'eu-north-1': 'Europe (Stockholm)',
  'eu-west-1': 'Europe (Ireland)',
  'eu-west-2': 'Europe (London)',
  'eu-west-3': 'Europe (Paris)',
  'eu-central-1': 'Europe (Frankfurt)',
  'eu-south-1': 'Europe (Milan)',
  
  // Asia Pacific
  'ap-east-1': 'Asia Pacific (Hong Kong)',
  'ap-south-1': 'Asia Pacific (Mumbai)',
  'ap-northeast-1': 'Asia Pacific (Tokyo)',
  'ap-northeast-2': 'Asia Pacific (Seoul)',
  'ap-northeast-3': 'Asia Pacific (Osaka)',
  'ap-southeast-1': 'Asia Pacific (Singapore)',
  'ap-southeast-2': 'Asia Pacific (Sydney)',
  
  // Middle East
  'me-south-1': 'Middle East (Bahrain)',
  
  // Africa
  'af-south-1': 'Africa (Cape Town)'
};

/**
 * Gets a human-readable name for an AWS region code
 * 
 * @param regionCode AWS region code (e.g., 'eu-central-1')
 * @returns Human-readable region name or the original code if not found
 */
export function getHumanReadableRegionName(regionCode: string): string {
  return regionToHumanReadableName[regionCode] || regionCode;
}
