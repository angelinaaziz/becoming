#!/usr/bin/env node

/**
 * This script extracts the contract interface from the metadata.json file
 * to help with frontend integration. It creates a TypeScript file with
 * the contract methods and their parameters.
 * 
 * Usage: node extract-contract-interface.js [path to metadata.json]
 */

const fs = require('fs');
const path = require('path');

// Default input and output paths
const DEFAULT_INPUT_PATH = path.join(__dirname, '../contract/target/ink/metadata.json');
const DEFAULT_OUTPUT_PATH = path.join(__dirname, '../frontend/src/types/contract-interface.ts');

// Get input path from command line args or use default
const inputPath = process.argv[2] || DEFAULT_INPUT_PATH;
const outputPath = process.argv[3] || DEFAULT_OUTPUT_PATH;

// Ensure the input file exists
if (!fs.existsSync(inputPath)) {
  console.error(`Error: Metadata file not found at ${inputPath}`);
  console.error('Please build the contract first or provide the correct path.');
  process.exit(1);
}

// Read and parse the metadata file
console.log(`Reading metadata from ${inputPath}...`);
const metadataRaw = fs.readFileSync(inputPath, 'utf8');
let metadata;

try {
  metadata = JSON.parse(metadataRaw);
} catch (error) {
  console.error('Error parsing metadata JSON:', error);
  process.exit(1);
}

// Extract contract name
const contractName = metadata.contract?.name || 'UnknownContract';
console.log(`Extracting interface for ${contractName}...`);

// Process spec to extract messages (methods)
const spec = metadata.spec || {};
const constructors = spec.constructors || [];
const messages = spec.messages || [];

// Create TypeScript interface
let output = `/**
 * Auto-generated TypeScript interface for ${contractName}
 * Generated from metadata.json
 */

export interface ${contractName}Interface {
  // Constructors
`;

// Add constructors
constructors.forEach(constructor => {
  const args = (constructor.args || [])
    .map(arg => `${arg.name}: ${mapType(arg.type)}`)
    .join(', ');
  
  output += `  ${constructor.name}(${args}): Promise<any>;\n`;
});

output += `
  // Messages
`;

// Add methods
messages.forEach(message => {
  const args = (message.args || [])
    .map(arg => `${arg.name}: ${mapType(arg.type)}`)
    .join(', ');
  
  const returnType = message.returnType ? mapType(message.returnType) : 'void';
  const modifier = message.mutates ? 'mutating' : 'readonly';
  
  output += `  /** ${modifier} */ ${message.name}(${args}): Promise<${returnType}>;\n`;
});

output += `}

/**
 * Contract events
 */
export type ${contractName}Events = {
`;

// Add events if available
if (spec.events && spec.events.length > 0) {
  spec.events.forEach(event => {
    output += `  ${event.name}: {\n`;
    if (event.args && event.args.length > 0) {
      event.args.forEach(arg => {
        output += `    ${arg.name}: ${mapType(arg.type)};\n`;
      });
    }
    output += `  };\n`;
  });
} else {
  output += `  // No events found in metadata\n`;
}

output += `}

/**
 * Helper function to map Substrate types to TypeScript types
 */
function mapType(type: string): any {
  // Basic implementation - expand this for more accurate type mapping
  if (type.includes('bool')) return 'boolean';
  if (type.includes('u8') || type.includes('u16') || type.includes('u32') || 
      type.includes('u64') || type.includes('u128') || type.includes('i32') ||
      type.includes('i64')) return 'number';
  if (type.includes('str') || type.includes('String')) return 'string';
  if (type.includes('Vec')) return 'any[]';
  if (type.includes('Option')) return 'any | null';
  if (type.includes('AccountId')) return 'string';
  if (type.includes('Hash')) return 'string';
  if (type.includes('Balance')) return 'string'; // Use string for large numbers
  return 'any';
}`;

// Helper function to map ink! types to TypeScript types
function mapType(type) {
  if (!type) return 'any';
  
  // Handle basic types
  if (typeof type === 'string') {
    if (type.includes('bool')) return 'boolean';
    if (type.match(/u(8|16|32)/)) return 'number';
    if (type.match(/u(64|128)/)) return 'string'; // Use string for large numbers
    if (type.match(/i(8|16|32|64)/)) return 'number';
    if (type.includes('str') || type.includes('String')) return 'string';
    if (type.includes('Vec')) return 'any[]';
    if (type.includes('Option')) return 'any | null';
    if (type.includes('AccountId')) return 'string';
    if (type.includes('Hash')) return 'string';
    if (type.includes('Balance')) return 'string'; // Use string for large numbers
  }
  
  // Handle complex types or fallback
  return 'any';
}

// Create output directory if it doesn't exist
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the interface to file
fs.writeFileSync(outputPath, output);
console.log(`Contract interface generated at ${outputPath}`);

// Additional helpful info
console.log(`
Helpful tips for frontend integration:
1. Import the interface in your useContract hook:
   import { ${contractName}Interface } from '../types/contract-interface';

2. Type your contract instance:
   const [contract, setContract] = useState<ContractPromise & ${contractName}Interface | null>(null);

3. Use the interface for better TypeScript support when calling contract methods.
`); 