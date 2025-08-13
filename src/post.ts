import { isFeatureAvailable, saveCache } from "@actions/cache";
import { getState, info } from "@actions/core";
import { STATE_KEYS } from "./shared";

async function post(): Promise<void> {
	try {
		const composerCacheDir = getState(STATE_KEYS.COMPOSER_CACHE_DIR);
		const cacheKey = getState(STATE_KEYS.CACHE_KEY);

		if (isFeatureAvailable() && composerCacheDir && cacheKey) {
			try {
				await saveCache([composerCacheDir], cacheKey);
				info(`Composer cache saved with key: ${cacheKey}`);
			} catch (error) {
				if ((error as Error).message?.includes("already exists")) {
					info("Composer cache already exists, skipping save");
				} else {
					info(`Failed to save composer cache: ${(error as Error).message}`);
				}
			}
		} else {
			info("No composer cache to save");
		}
	} catch (error) {
		info(`Post-action failed: ${(error as Error).message}`);
	}
}

post();
