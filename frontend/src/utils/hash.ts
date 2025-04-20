/**
 * Utility functions for hashing text and files
 */

/**
 * Creates a SHA-256 hash from text or file data
 * @param data - The text string or file to hash
 * @returns A hex string representation of the SHA-256 hash
 */
export async function hashProof(data: string | ArrayBuffer): Promise<string> {
  try {
    // Convert string data to ArrayBuffer if necessary
    let buffer: ArrayBuffer;
    if (typeof data === 'string') {
      const encoder = new TextEncoder();
      buffer = encoder.encode(data);
    } else {
      buffer = data;
    }
    
    // Use the Web Crypto API to create a SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    
    // Convert the hash to a hex string
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Error hashing data:', error);
    throw new Error('Failed to generate proof hash');
  }
}

/**
 * Reads a file as ArrayBuffer for hashing
 * @param file - The File object to read
 * @returns Promise resolving to ArrayBuffer containing file data
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Convenience function to hash a file
 * @param file - The File object to hash
 * @returns Promise resolving to hex string of SHA-256 hash
 */
export async function hashFile(file: File): Promise<string> {
  const buffer = await readFileAsArrayBuffer(file);
  return hashProof(buffer);
}

/**
 * Convenience function to hash text
 * @param text - The text to hash
 * @returns Promise resolving to hex string of SHA-256 hash
 */
export async function hashText(text: string): Promise<string> {
  return hashProof(text);
} 