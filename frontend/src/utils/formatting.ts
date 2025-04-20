/**
 * Format a blockchain address by showing only the start and end portions
 * @param address The full blockchain address
 * @param charsToShow Number of characters to show at the start and end
 * @returns The formatted address string
 */
export const formatAddress = (address: string, charsToShow: number = 4): string => {
  if (!address || address.length <= (charsToShow * 2)) {
    return address;
  }
  
  return `${address.substring(0, charsToShow)}...${address.substring(address.length - charsToShow)}`;
};

/**
 * Add commas to large numbers for better readability
 * @param num The number to format
 * @returns Formatted number string with commas
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format a date in a human-readable format
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}; 