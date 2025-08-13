import { getInput, info, setFailed, saveState } from '@actions/core';
import { exec, getExecOutput } from '@actions/exec';
import {restoreCache} from '@actions/cache';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { STATE_KEYS } from './shared';

async function run(): Promise<void> {
  try {
    const path = getInput('path', { required: true });
    const githubToken = getInput('github-token');
    const additionalCacheKey = getInput('additional-composer-cache-key');
    
    try {
      await getExecOutput('which', ['shopware-cli'], { silent: true });
    } catch {
      throw new Error(
        'shopware-cli is not installed. Please install it first using the official GitHub Action:\n' +
        'https://github.com/shopware/shopware-cli-action\n\n' +
        'Example:\n' +
        '- uses: shopware/shopware-cli-action@v1\n'
      );
    }
    
    let composerCacheDir: string | undefined;
    let cacheKey: string | undefined;
    
    try {
      const { stdout } = await getExecOutput('composer', ['config', 'cache-files-dir'], {
        cwd: path,
        silent: true
      });
      composerCacheDir = stdout.trim();
    } catch (error) {
      info('Could not determine composer cache directory, skipping cache');
    }
    
    if (composerCacheDir) {
      const composerLockPath = join(path, 'composer.lock');
      const composerJsonPath = join(path, 'composer.json');
      
      if (existsSync(composerLockPath)) {
        const lockContent = readFileSync(composerLockPath, 'utf8');
        const hash = createHash('sha256').update(lockContent).digest('hex');
        cacheKey = `composer-${process.platform}-${hash}`;
        if (additionalCacheKey) {
          cacheKey += `-${additionalCacheKey}`;
        }
        info(`Using composer.lock for cache key: ${cacheKey}`);
      } else if (existsSync(composerJsonPath)) {
        const jsonContent = readFileSync(composerJsonPath, 'utf8');
        const hash = createHash('sha256').update(jsonContent).digest('hex');
        cacheKey = `composer-${process.platform}-${hash}`;
        if (additionalCacheKey) {
          cacheKey += `-${additionalCacheKey}`;
        }
        info(`Using composer.json for cache key: ${cacheKey}`);
      }
      
      if (cacheKey) {
        try {
          const cacheHit = await restoreCache([composerCacheDir], cacheKey, [`composer-${process.platform}-`]);
          if (cacheHit) {
            info(`Composer cache restored from key: ${cacheHit}`);
          } else {
            info('Composer cache not found');
          }
          
          // Save state for post-action with unique prefix
          saveState(STATE_KEYS.COMPOSER_CACHE_DIR, composerCacheDir);
          saveState(STATE_KEYS.CACHE_KEY, cacheKey);
        } catch (error) {
          info(`Failed to restore composer cache: ${(error as Error).message}`);
        }
      }
    }
    
    const env: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        env[key] = value;
      }
    }
    
    if (githubToken) {
      env.GITHUB_TOKEN = githubToken;
    }
    
    const exitCode = await exec('shopware-cli', ['project', 'ci', path], {
      env: env,
      ignoreReturnCode: true
    });
    
    if (exitCode !== 0) {
      throw new Error(`shopware-cli exited with code ${exitCode}`);
    }
    
    info('Build completed successfully');
    
  } catch (error) {
    setFailed(`Action failed: ${(error as Error).message}`);
  }
}

run();