#!/usr/bin/env bun

/**
 * Asset Hash Generation for Cache Invalidation
 * Leverages Bun 1.2.21 native APIs for optimal performance
 */

import { join } from "path";
import { createHash } from "crypto";

interface HashData {
  files: Record<string, string>;
  combined: string;
  lastBuild: string;
}

interface CacheData {
  version: string;
  shortVersion: string;
  files: {
    css: string;
    js: string;
  };
  timestamp: string;
  cacheStrategy: {
    shouldInvalidate: boolean;
    cacheKeys: string[];
  };
}

class AssetHasher {
  private srcDir: string;
  private assetsDir: string;
  private dataDir: string;
  private hashFilePath: string;
  private watchFiles: string[];

  constructor() {
    this.srcDir = join(process.cwd(), 'src');
    this.assetsDir = join(this.srcDir, 'assets');
    this.dataDir = join(this.srcDir, '_data');
    this.hashFilePath = join(this.dataDir, 'hashes.json');
    
    // Files to monitor for changes
    this.watchFiles = [
      'src/design-tokens/tokens.json',
      'src/assets/css/critical.css',
      'src/assets/css/main.css', 
      'src/assets/main.js'
    ];
  }

  /**
   * Calculate hash for a file using Bun.file()
   */
  async hashFile(filePath: string): Promise<string> {
    try {
      const file = Bun.file(filePath);
      if (await file.exists()) {
        const content = await file.text();
        return createHash('md5').update(content).digest('hex').substring(0, 8);
      }
    } catch (error) {
      console.warn(`Warning: Could not hash ${filePath}`);
    }
    return 'missing';
  }

  /**
   * Generate hashes for all watched files
   */
  async generateFileHashes(): Promise<Record<string, string>> {
    const hashes: Record<string, string> = {};
    
    for (const file of this.watchFiles) {
      const fullPath = join(process.cwd(), file);
      const fileName = file.split('/').pop()?.replace(/\.(css|js|json)$/, '') || 'unknown';
      hashes[fileName] = await this.hashFile(fullPath);
    }
    
    return hashes;
  }

  /**
   * Generate combined content hash using Bun.file()
   */
  async generateCombinedHash(): Promise<string> {
    let combinedContent = '';
    
    for (const file of this.watchFiles) {
      const fullPath = join(process.cwd(), file);
      try {
        const fileObj = Bun.file(fullPath);
        if (await fileObj.exists()) {
          combinedContent += await fileObj.text();
        }
      } catch (error) {
        console.warn(`Warning: Could not read ${file} for combined hash`);
      }
    }
    
    return createHash('md5').update(combinedContent).digest('hex').substring(0, 12);
  }

  /**
   * Load previous hashes using Bun.file()
   */
  async loadPreviousHashes(): Promise<HashData> {
    try {
      const hashFile = Bun.file(this.hashFilePath);
      if (await hashFile.exists()) {
        const content = await hashFile.text();
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn('Could not load previous hashes, treating as first build');
    }
    return { files: {}, combined: '', lastBuild: '' };
  }

  /**
   * Check if files have changed since last build
   */
  async detectChanges() {
    const currentHashes = await this.generateFileHashes();
    const currentCombined = await this.generateCombinedHash();
    const previous = await this.loadPreviousHashes();
    
    const changedFiles: string[] = [];
    
    // Check individual file changes
    for (const [file, hash] of Object.entries(currentHashes)) {
      if (previous.files[file] !== hash) {
        changedFiles.push(file);
      }
    }
    
    const hasChanges = changedFiles.length > 0 || previous.combined !== currentCombined;
    
    return {
      hasChanges,
      changedFiles,
      currentHashes: {
        files: currentHashes,
        combined: currentCombined,
        lastBuild: new Date().toISOString()
      },
      previous
    };
  }

  /**
   * Save current hashes using Bun.write()
   */
  async saveHashes(hashData: HashData) {
    // Ensure _data directory exists using Bun shell
    const dataDir = Bun.file(this.dataDir);
    if (!await dataDir.exists()) {
      await Bun.$`mkdir -p ${this.dataDir}`;
    }
    
    await Bun.write(this.hashFilePath, JSON.stringify(hashData, null, 2));
  }

  /**
   * Generate cache invalidation data for templates
   */
  async generateCacheData(hashData: HashData): Promise<CacheData> {
    const cacheData: CacheData = {
      version: hashData.combined,
      shortVersion: hashData.combined.substring(0, 8),
      files: {
        css: `main-${hashData.files.main || hashData.files.critical}.css`,
        js: `main-${hashData.files.main}.js`
      },
      timestamp: hashData.lastBuild,
      cacheStrategy: {
        shouldInvalidate: true,
        cacheKeys: [
          `css-v${hashData.combined}`,
          `js-v${hashData.combined}`,
          `shell-v${hashData.combined}`
        ]
      }
    };
    
    // Write cache data for templates using Bun.write()
    const cacheDataFile = join(this.dataDir, 'cache.json');
    await Bun.write(cacheDataFile, JSON.stringify(cacheData, null, 2));
    
    return cacheData;
  }

  /**
   * Main hashing process
   */
  async process(): Promise<CacheData> {
    console.log('🔍 Checking for asset changes...');
    
    const changes = await this.detectChanges();
    
    if (changes.hasChanges) {
      console.log('📝 Changes detected in:');
      changes.changedFiles.forEach(file => console.log(`   - ${file}`));
      
      // Save new hashes
      await this.saveHashes(changes.currentHashes);
      
      // Generate cache data for templates
      const cacheData = await this.generateCacheData(changes.currentHashes);
      
      console.log('✅ Asset hashes updated:');
      console.log(`   - Combined Version: ${cacheData.version}`);
      console.log(`   - CSS File: ${cacheData.files.css}`);
      console.log(`   - JS File: ${cacheData.files.js}`);
      
      return cacheData;
    } else {
      console.log('✨ No changes detected, using existing hashes');
      
      // Still generate cache data from current hashes
      const cacheData = await this.generateCacheData(changes.currentHashes);
      return cacheData;
    }
  }

  /**
   * Force regeneration of all hashes (useful for clean builds)
   */
  async forceRegenerate(): Promise<CacheData> {
    console.log('🔄 Force regenerating all asset hashes...');
    
    // Remove existing hash file using Bun shell
    const hashFile = Bun.file(this.hashFilePath);
    if (await hashFile.exists()) {
      await Bun.$`rm ${this.hashFilePath}`;
    }
    
    return await this.process();
  }
}

// CLI interface
if (import.meta.main) {
  const hasher = new AssetHasher();
  const forceFlag = process.argv.includes('--force');
  
  if (forceFlag) {
    await hasher.forceRegenerate();
  } else {
    await hasher.process();
  }
}

export default AssetHasher;