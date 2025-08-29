#!/usr/bin/env node

/**
 * Translation Manager Script
 * 
 * Advanced script for checking and managing translations across all languages.
 * Base language is English (en), and all other languages are compared against it.
 * 
 * Features:
 * - Detects missing translation files
 * - Detects missing translation keys
 * - Detailed reporting with color-coded console output
 * - Option to auto-generate missing translation files/keys
 * - Filter by specific files or paths
 * 
 * Usage: 
 *   Basic check:     node translation-manager.js
 *   Auto-fix:        node translation-manager.js --fix
 *   Check one file:  node translation-manager.js --file=Story.json
 *   Check specific:  node translation-manager.js --path=form.email
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (arg === '--fix') {
    acc.autoFix = true;
  } else if (arg.startsWith('--file=')) {
    acc.file = arg.replace('--file=', '');
  } else if (arg.startsWith('--path=')) {
    acc.path = arg.replace('--path=', '');
  } else if (arg === '--help') {
    acc.help = true;
  }
  return acc;
}, { autoFix: false, file: null, path: null, help: false });

// Configuration
const BASE_LANGUAGE = 'en';
const MESSAGES_DIR = path.join(__dirname, '..', 'messages');
const SUPPORTED_LANGUAGES = ['de', 'en', 'es', 'fr', 'it', 'pt', 'ro', 'ru']; // Based on your project architecture

// Statistics
const stats = {
  languages: 0,
  files: {
    total: 0,
    missing: 0
  },
  keys: {
    total: 0,
    missing: 0
  },
  fixed: {
    files: 0,
    keys: 0
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

/**
 * Display help information
 */
function showHelp() {
  console.log(`${colors.bold}${colors.cyan}Translation Manager${colors.reset}`);
  console.log(`A tool to manage translation files across multiple languages.\n`);
  
  console.log(`${colors.bold}Usage:${colors.reset}`);
  console.log(`  node translation-manager.js [options]\n`);
  
  console.log(`${colors.bold}Options:${colors.reset}`);
  console.log(`  --help            Show this help information`);
  console.log(`  --fix             Auto-fix missing files and keys by copying from base language`);
  console.log(`  --file=<name>     Check only a specific file (e.g. --file=Auth.json)`);
  console.log(`  --path=<path>     Check only keys under a specific path (e.g. --path=form.email)\n`);
  
  console.log(`${colors.bold}Examples:${colors.reset}`);
  console.log(`  node translation-manager.js`);
  console.log(`  node translation-manager.js --fix`);
  console.log(`  node translation-manager.js --file=Auth.json --fix`);
  console.log(`  node translation-manager.js --path=form.email\n`);
  
  process.exit(0);
}

// Show help if requested
if (args.help) {
  showHelp();
}

/**
 * Get all language directories
 */
function getLanguages() {
  return fs.readdirSync(MESSAGES_DIR)
    .filter(file => fs.statSync(path.join(MESSAGES_DIR, file)).isDirectory());
}

/**
 * Get all JSON files for a language
 */
function getJsonFiles(language) {
  const langDir = path.join(MESSAGES_DIR, language);
  return fs.readdirSync(langDir)
    .filter(file => file.endsWith('.json'))
    .map(file => file);
}

/**
 * Load a JSON file
 */
function loadJsonFile(language, file) {
  const filePath = path.join(MESSAGES_DIR, language, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Error loading file ${filePath}: ${error.message}`);
    }
    return null;
  }
}

/**
 * Write content to a JSON file
 */
function writeJsonFile(language, file, content) {
  const filePath = path.join(MESSAGES_DIR, language, file);
  const dirPath = path.dirname(filePath);
  
  // Ensure directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Find missing keys recursively in an object
 */
function findMissingKeys(basePath, baseObj, compareObj, missing = [], keyPath = '') {
  if (!baseObj || typeof baseObj !== 'object') return missing;
  if (!compareObj || typeof compareObj !== 'object') return [...missing, basePath];
  
  // If a specific path is provided, check if we're in that path
  if (args.path && !basePath.startsWith(args.path) && args.path !== basePath) {
    if (!basePath || !args.path.startsWith(basePath)) {
      return missing;
    }
  }

  for (const key in baseObj) {
    const newPath = basePath ? `${basePath}.${key}` : key;
    
    if (!(key in compareObj)) {
      missing.push(newPath);
    } else if (
      typeof baseObj[key] === 'object' && 
      baseObj[key] !== null &&
      typeof compareObj[key] === 'object' &&
      compareObj[key] !== null
    ) {
      findMissingKeys(newPath, baseObj[key], compareObj[key], missing);
    }
  }
  
  return missing;
}

/**
 * Get a value from an object using dot notation path
 */
function getValueByPath(obj, path) {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : undefined;
  }, obj);
}

/**
 * Set a value in an object using dot notation path
 */
function setValueByPath(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

/**
 * Fix missing keys in a language file
 */
function fixMissingKeys(language, file, baseContent, langContent, missingKeys) {
  if (!langContent) {
    langContent = {};
  }
  
  let updated = false;
  for (const key of missingKeys) {
    const value = getValueByPath(baseContent, key);
    setValueByPath(langContent, key, value);
    updated = true;
    stats.fixed.keys++;
  }
  
  if (updated) {
    writeJsonFile(language, file, langContent);
  }
  
  return updated;
}

/**
 * Validate if a string is a proper language code
 */
function isValidLanguage(lang) {
  return SUPPORTED_LANGUAGES.includes(lang);
}

/**
 * Format key paths for better readability
 */
function formatKeyPath(path, maxLength = 40) {
  if (path.length <= maxLength) return path;
  
  const parts = path.split('.');
  if (parts.length <= 2) return path;
  
  const first = parts[0];
  const last = parts.slice(-2).join('.');
  return `${first}...${last}`;
}

/**
 * Count keys in an object recursively
 */
function countKeys(obj) {
  if (!obj || typeof obj !== 'object') return 0;
  
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key]);
    } else {
      count++;
    }
  }
  return count;
}

/**
 * Main function
 */
function checkTranslations() {
  const languages = getLanguages().filter(isValidLanguage);
  stats.languages = languages.length - 1; // Excluding base language
  
  if (!languages.includes(BASE_LANGUAGE)) {
    console.error(`${colors.red}Base language '${BASE_LANGUAGE}' not found in messages directory.${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.bold}${colors.cyan}Translation Manager${colors.reset}`);
  console.log(`${colors.cyan}===================${colors.reset}\n`);
  console.log(`Base language: ${colors.green}${BASE_LANGUAGE}${colors.reset}`);
  console.log(`Found ${colors.green}${languages.length}${colors.reset} languages: ${colors.green}${languages.join(', ')}${colors.reset}`);
  
  const baseFiles = getJsonFiles(BASE_LANGUAGE);
  stats.files.total = baseFiles.length * stats.languages;
  
  if (args.file) {
    if (!baseFiles.includes(args.file)) {
      console.error(`${colors.red}File '${args.file}' not found in base language.${colors.reset}`);
      process.exit(1);
    }
    console.log(`Focusing on file: ${colors.yellow}${args.file}${colors.reset}`);
  }
  
  if (args.path) {
    console.log(`Focusing on path: ${colors.yellow}${args.path}${colors.reset}`);
  }
  
  if (args.autoFix) {
    console.log(`${colors.yellow}Auto-fix mode is enabled. Missing keys will be copied from the base language.${colors.reset}`);
  }
  
  console.log(`\nAnalyzing ${colors.green}${args.file ? 1 : baseFiles.length}${colors.reset} file(s) across ${colors.green}${stats.languages}${colors.reset} language(s)...\n`);
  
  // Track per-language stats
  const languageStats = {};
  languages.forEach(lang => {
    if (lang !== BASE_LANGUAGE) {
      languageStats[lang] = { missingFiles: 0, missingKeys: 0 };
    }
  });
  
  // Filter files if needed
  const filesToCheck = args.file ? [args.file] : baseFiles;
  
  // Check each language against the base language
  for (const lang of languages) {
    if (lang === BASE_LANGUAGE) continue;
    
    console.log(`${colors.bold}${colors.cyan}Checking language: ${lang}${colors.reset}`);
    
    const langFiles = getJsonFiles(lang);
    const missingFiles = filesToCheck.filter(file => !langFiles.includes(file));
    
    if (missingFiles.length > 0) {
      console.log(`${colors.red}Missing files:${colors.reset} ${missingFiles.join(', ')}`);
      stats.files.missing += missingFiles.length;
      languageStats[lang].missingFiles = missingFiles.length;
      
      if (args.autoFix) {
        for (const file of missingFiles) {
          const baseContent = loadJsonFile(BASE_LANGUAGE, file);
          if (baseContent) {
            console.log(`  ${colors.green}Creating${colors.reset} ${file} for ${lang}`);
            writeJsonFile(lang, file, baseContent);
            stats.fixed.files++;
          }
        }
      }
    } else {
      console.log(`${colors.green}All files present ✓${colors.reset}`);
    }
    
    // Check for missing keys in each file
    for (const file of filesToCheck) {
      if (args.file && file !== args.file) continue;
      
      // Skip if file doesn't exist and we're not auto-fixing
      if (!langFiles.includes(file) && !args.autoFix) continue;
      
      const baseContent = loadJsonFile(BASE_LANGUAGE, file);
      const langContent = loadJsonFile(lang, file);
      
      if (!baseContent) {
        console.log(`  ${colors.yellow}Warning: Could not load base file ${file}${colors.reset}`);
        continue;
      }
      
      // Calculate total keys in base file for this path
      const totalBaseKeys = countKeys(
        args.path ? getValueByPath(baseContent, args.path) : baseContent
      );
      
      const missingKeys = findMissingKeys('', baseContent, langContent || {});
      stats.keys.missing += missingKeys.length;
      languageStats[lang].missingKeys += missingKeys.length;
      
      if (missingKeys.length > 0) {
        console.log(`  ${colors.yellow}File: ${file} - Missing ${missingKeys.length} keys:${colors.reset}`);
        
        // Group by top-level section for better readability
        const groupedMissing = missingKeys.reduce((acc, key) => {
          const topLevel = key.split('.')[0] || 'root';
          if (!acc[topLevel]) acc[topLevel] = [];
          acc[topLevel].push(key);
          return acc;
        }, {});
        
        // Print grouped missing keys
        for (const [section, keys] of Object.entries(groupedMissing)) {
          console.log(`    ${colors.cyan}${section}:${colors.reset}`);
          for (const key of keys) {
            const baseValue = getValueByPath(baseContent, key);
            const formattedValue = typeof baseValue === 'string' 
              ? `"${baseValue.substring(0, 40)}${baseValue.length > 40 ? '...' : ''}"` 
              : '[object]';
            
            console.log(`      - ${formatKeyPath(key)} ${colors.gray}(${formattedValue})${colors.reset}`);
          }
        }
        
        if (args.autoFix) {
          const updated = fixMissingKeys(lang, file, baseContent, langContent, missingKeys);
          if (updated) {
            console.log(`    ${colors.green}✓ Fixed ${missingKeys.length} keys in ${file}${colors.reset}`);
          }
        }
      }
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Summary
  console.log(`${colors.bold}${colors.cyan}Summary:${colors.reset}`);
  
  if (stats.files.missing === 0 && stats.keys.missing === 0) {
    console.log(`${colors.green}All translations are complete! ✓${colors.reset}`);
  } else {
    console.log(`${colors.yellow}Found ${stats.files.missing} missing files and ${stats.keys.missing} missing keys across all languages.${colors.reset}`);
    
    if (args.autoFix) {
      console.log(`${colors.green}Fixed ${stats.fixed.files} missing files and ${stats.fixed.keys} missing keys.${colors.reset}`);
    }
    
    // Per-language summary
    console.log(`\n${colors.cyan}Per-language statistics:${colors.reset}`);
    console.log(`${'Language'.padEnd(10)} | ${'Missing Files'.padEnd(15)} | Missing Keys`);
    console.log(`${'-'.repeat(10)} | ${'-'.repeat(15)} | ${'-'.repeat(12)}`);
    
    for (const [lang, stats] of Object.entries(languageStats)) {
      const fileStatus = stats.missingFiles > 0 
        ? `${colors.red}${stats.missingFiles}${colors.reset}` 
        : `${colors.green}0${colors.reset}`;
        
      const keyStatus = stats.missingKeys > 0
        ? `${colors.yellow}${stats.missingKeys}${colors.reset}`
        : `${colors.green}0${colors.reset}`;
        
      console.log(`${lang.padEnd(10)} | ${fileStatus.padEnd(15)} | ${keyStatus}`);
    }
  }
  
  if (!args.autoFix && (stats.files.missing > 0 || stats.keys.missing > 0)) {
    console.log(`\n${colors.cyan}Tip: Run with --fix flag to automatically copy missing files/keys from the base language.${colors.reset}`);
  }
}

// Run the script
checkTranslations();
