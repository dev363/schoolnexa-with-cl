import identifierConfig from '../../src/config/schoolnexa-identifiers.json';

export type BusinessCodeKey = keyof typeof identifierConfig.businessCodes;
export type InternalIdKey = keyof typeof identifierConfig.internalIds;
export type RoleKey = keyof typeof identifierConfig.roles;

/**
 * Returns raw business prefix without trailing hyphen (e.g. "FAC", "ADM", "NAT", "AY")
 */
export function getRawBusinessPrefix(key: BusinessCodeKey): string {
  const item = identifierConfig.businessCodes[key];
  if ('rawPrefix' in item && item.rawPrefix) {
    return item.rawPrefix;
  }
  return item.prefix.endsWith('-') ? item.prefix.slice(0, -1) : item.prefix;
}

/**
 * Returns prefix with delimiter (e.g. "FAC-", "ADM-", "NAT-")
 */
export function getBusinessPrefix(key: BusinessCodeKey): string {
  return identifierConfig.businessCodes[key].prefix;
}

/**
 * Returns internal ID prefix (e.g. "stf-", "stu-", "sec-", "cls-", "tt-")
 */
export function getInternalIdPrefix(key: InternalIdKey): string {
  return identifierConfig.internalIds[key].prefix;
}

/**
 * Builds a regex pattern to match a given business code prefix (e.g. /^FAC-\d+$/i)
 */
export function getBusinessCodePattern(key: BusinessCodeKey): RegExp {
  const prefix = getBusinessPrefix(key);
  // Escapes any special regex characters in the prefix
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}\\d+$`, 'i');
}

/**
 * Builds standard admission number based on configuration
 */
export function buildAdmissionNumber(
  year: number | string = new Date().getFullYear(),
  sequence: number | string,
): string {
  const prefix = getBusinessPrefix('admission');
  const seqStr = String(sequence).padStart(3, '0');
  return `${prefix}${year}-${seqStr}`;
}

export { identifierConfig };
export default identifierConfig;
