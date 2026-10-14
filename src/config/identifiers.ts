import identifierConfig from '@/config/schoolnexa-identifiers.json';

export type BusinessCodeKey = keyof typeof identifierConfig.businessCodes;
export type InternalIdKey = keyof typeof identifierConfig.internalIds;
export type RoleKey = keyof typeof identifierConfig.roles;

/**
 * Returns the raw prefix without trailing hyphen (e.g. "FAC", "ADM", "STU")
 */
export function getRawBusinessPrefix(key: BusinessCodeKey): string {
  const item = identifierConfig.businessCodes[key];
  if ('rawPrefix' in item && item.rawPrefix) {
    return item.rawPrefix;
  }
  return item.prefix.endsWith('-') ? item.prefix.slice(0, -1) : item.prefix;
}

/**
 * Returns the prefix including delimiter (e.g. "FAC-", "ADM-", "STU-")
 */
export function getBusinessPrefix(key: BusinessCodeKey): string {
  return identifierConfig.businessCodes[key].prefix;
}

/**
 * Returns the internal entity ID prefix (e.g. "stf-", "stu-", "sec-", "cls-", "tt-")
 */
export function getInternalIdPrefix(key: InternalIdKey): string {
  return identifierConfig.internalIds[key].prefix;
}

/**
 * Builds standard admission number based on configuration pattern
 */
export function generateAdmissionNumber(
  year: number | string = new Date().getFullYear(),
  sequence: number | string,
): string {
  const prefix = getBusinessPrefix('admission');
  const seqStr = String(sequence).padStart(3, '0');
  return `${prefix}${year}-${seqStr}`;
}

export const buildAdmissionNumber = generateAdmissionNumber;

/**
 * Builds a regex pattern to match a given business code prefix (e.g. /^FAC-\d+$/i)
 */
export function getBusinessCodePattern(key: BusinessCodeKey): RegExp {
  const prefix = getBusinessPrefix(key);
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}\\d+$`, 'i');
}

/**
 * Builds placeholder or example string
 */
export function getBusinessCodeExample(key: BusinessCodeKey, index: number = 0): string {
  const examples = identifierConfig.businessCodes[key]?.examples;
  return examples && examples[index] ? examples[index] : getBusinessPrefix(key);
}

export { identifierConfig };
export default identifierConfig;
