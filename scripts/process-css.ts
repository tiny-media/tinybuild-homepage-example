#!/usr/bin/env bun

/**
 * CSS Processing Script for Progressive Islands Template
 * Leverages Bun 1.2.21 native APIs for optimal performance
 */

import { join } from "path";
import { createHash } from "crypto";

class CSSProcessor {
  private srcDir: string;
  private assetsDir: string;
  private cssDir: string;
  private tokensFile: string;
  private dataDir: string;

  constructor() {
    this.srcDir = join(process.cwd(), 'src');
    this.assetsDir = join(this.srcDir, 'assets');
    this.cssDir = join(this.assetsDir, 'css');
    this.tokensFile = join(this.srcDir, 'design-tokens', 'tokens.json');
    this.dataDir = join(this.srcDir, '_data');
  }

  /**
   * Initialize directories if needed
   */
  async init() {
    // Ensure directories exist using Bun's native mkdir
    const dataDir = Bun.file(this.dataDir);
    if (!await dataDir.exists()) {
      await Bun.$`mkdir -p ${this.dataDir}`;
    }
  }

  /**
   * Read and combine CSS files using Bun.file()
   */
  async getCSSContent() {
    const criticalFile = Bun.file(join(this.cssDir, 'critical.css'));
    const mainFile = Bun.file(join(this.cssDir, 'main.css'));
    
    const critical = await criticalFile.text().catch(() => '/* Critical CSS not found */');
    const main = await mainFile.text().catch(() => '/* Main CSS not found */');
    
    return {
      critical,
      main,
      combined: critical + '\n\n' + main
    };
  }

  /**
   * Read design tokens using Bun.file()
   */
  async getTokens() {
    try {
      const tokensFile = Bun.file(this.tokensFile);
      if (await tokensFile.exists()) {
        const content = await tokensFile.text();
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn('Warning: Could not read tokens.json, using empty tokens');
    }
    return {};
  }

  /**
   * Generate content-based hash using Bun's crypto
   */
  generateContentHash(content: string): string {
    return createHash('md5')
      .update(content)
      .digest('hex')
      .substring(0, 8);
  }

  /**
   * Generate all asset hashes and metadata
   */
  async generateAssetMetadata() {
    const tokens = await this.getTokens();
    const css = await this.getCSSContent();
    
    // Read JavaScript content using Bun.file()
    const mainJSFile = Bun.file(join(this.assetsDir, 'main.js'));
    const mainJS = await mainJSFile.text().catch(() => '/* Main JS not found */');
    
    // Generate individual hashes
    const tokensHash = this.generateContentHash(JSON.stringify(tokens));
    const cssHash = this.generateContentHash(css.combined);
    const jsHash = this.generateContentHash(mainJS);
    
    // Generate combined hash for overall cache version
    const combinedContent = JSON.stringify(tokens) + css.combined + mainJS;
    const combinedHash = this.generateContentHash(combinedContent);

    return {
      version: combinedHash,
      tokens: {
        hash: tokensHash,
        content: tokens
      },
      css: {
        hash: cssHash,
        critical: css.critical,
        main: css.main,
        combined: css.combined,
        size: {
          critical: new Blob([css.critical]).size,
          main: new Blob([css.main]).size,
          combined: new Blob([css.combined]).size
        }
      },
      js: {
        hash: jsHash,
        content: mainJS,
        size: new Blob([mainJS]).size
      },
      timestamp: new Date().toISOString(),
      buildId: `${Date.now()}-${combinedHash}`
    };
  }

  /**
   * Write asset metadata using Bun.write()
   */
  async writeAssetData(metadata: any) {
    const dataFile = join(this.dataDir, 'assets.json');
    await Bun.write(dataFile, JSON.stringify(metadata, null, 2));
    
    console.log('✅ Asset metadata generated:');
    console.log(`   - Version: ${metadata.version}`);
    console.log(`   - CSS Size: ${(metadata.css.size.combined / 1024).toFixed(1)}KB`);
    console.log(`   - JS Size: ${(metadata.js.size / 1024).toFixed(1)}KB`);
    console.log(`   - Build ID: ${metadata.buildId}`);
  }

  /**
   * Main processing function
   */
  async process() {
    console.log('🔄 Processing CSS and generating asset metadata...');
    
    try {
      await this.init();
      const metadata = await this.generateAssetMetadata();
      await this.writeAssetData(metadata);
      
      console.log('✨ CSS processing complete!');
      return metadata;
    } catch (error) {
      console.error('❌ CSS processing failed:', error);
      process.exit(1);
    }
  }
}

// Run if called directly
if (import.meta.main) {
  const processor = new CSSProcessor();
  await processor.process();
}

export default CSSProcessor;