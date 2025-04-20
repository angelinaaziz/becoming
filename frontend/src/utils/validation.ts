/**
 * Validation utilities for the Becoming NFT application
 */

/**
 * Validates a milestone title
 * @param title The milestone title to validate
 * @returns true if the title is valid, false otherwise
 */
export const isValidMilestoneTitle = (title: string): boolean => {
  if (!title || typeof title !== 'string') return false;
  
  const trimmedTitle = title.trim();
  const minLength = 3;
  const maxLength = 50;
  
  return trimmedTitle.length >= minLength && trimmedTitle.length <= maxLength;
};

/**
 * Validates a milestone description
 * @param description The milestone description to validate
 * @returns true if the description is valid, false otherwise
 */
export const isValidMilestoneDescription = (description: string): boolean => {
  if (!description || typeof description !== 'string') return false;
  
  const trimmedDescription = description.trim();
  const minLength = 3;
  const maxLength = 500;
  
  return trimmedDescription.length >= minLength && trimmedDescription.length <= maxLength;
};

/**
 * Validates a proof hash
 * @param hash The proof hash to validate (can be file hash, IPFS CID, or other verifiable hash)
 * @returns true if the hash is valid, false otherwise
 */
export const isValidProofHash = (hash: string): boolean => {
  if (!hash || typeof hash !== 'string') return false;
  
  // Remove any potential prefixes like "0x" or "sha256:"
  const cleanHash = hash.replace(/^(0x|sha256:|ipfs:)/, '').trim();
  
  // Basic length validation (most hash algorithms produce fixed-length output)
  const minLength = 32; // Most hash algorithms produce at least 32 chars
  const maxLength = 128; // Allow for longer hashes and CIDs
  
  // Basic format validation - only allow alphanumeric and some special chars used in CIDs
  const validFormat = /^[a-zA-Z0-9+/=_-]+$/;
  
  return (
    cleanHash.length >= minLength && 
    cleanHash.length <= maxLength && 
    validFormat.test(cleanHash)
  );
}; 