import { getInput, info, setFailed } from '@actions/core';
import { exec, getExecOutput } from '@actions/exec';

async function run() {
  try {
    const path = getInput('path', { required: true });
    const githubToken = getInput('github-token');
    
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
    
    const env = {
      ...process.env
    };
    
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
    setFailed(`Action failed: ${error.message}`);
  }
}

run();