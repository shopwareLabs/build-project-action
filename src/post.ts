import { isFeatureAvailable, saveCache } from "@actions/cache";
import { getState, info, startGroup, endGroup } from "@actions/core";
import { STATE_KEYS } from "./shared";

async function post(): Promise<void> {
	try {
		startGroup("💾 Save Composer Cache");

		const composerCacheDir = getState(STATE_KEYS.COMPOSER_CACHE_DIR);
		const cacheKey = getState(STATE_KEYS.CACHE_KEY);

		if (!isFeatureAvailable()) {
			info("⚠️ Cache service is not available");
		} else if (!composerCacheDir || !cacheKey) {
			info("ℹ️ No composer cache to save");
		} else {
			try {
				await saveCache([composerCacheDir], cacheKey);
				info(`✅ Cache saved with key: ${cacheKey}`);
			} catch (error) {
				if ((error as Error).message?.includes("already exists")) {
					info("ℹ️ Cache already exists, skipping save");
				} else {
					info(`❌ Failed to save cache: ${(error as Error).message}`);
				}
			}
		}

		endGroup();
	} catch (error) {
		info(`Post-action failed: ${(error as Error).message}`);
	}
}

post();
