import { getLazerPath, getDownloadPath } from "./settings";
import { getBeatmapSetIds } from "./realm";

export let beatmapIds: Set<number> = new Set();

export const loadBeatmaps = async (): Promise<Set<number>> => {
  const lazerPath = await getLazerPath();

  try {
    const ids = await getBeatmapSetIds(lazerPath);
    beatmapIds = ids;
  } catch (err) {
    console.error("Failed to load beatmaps from Realm:", err);
    beatmapIds = new Set();
  }

  return beatmapIds;
};

export const getSongsFolder = async (): Promise<string> => {
  return getDownloadPath();
};
