import settings from "electron-settings";
import { cloneDeep } from "lodash";
import { readCollections, writeCollections } from "./parse";
import { window } from '../../../../main'
import axios from "axios";
import { serverUri } from "../../../ipc/main";
import { BeatmapHashMap } from "../../../../models/api";
import { beatmapIds, loadBeatmaps } from "../../../beatmaps";

export const checkCollections = async () => {
  const osuPath = await settings.get("path") as string;
  const collections = await readCollections(osuPath)

  const collectionMapHashes = new Set<string>()

  for (const collection of collections.collections) {
    for (const hash of collection.hashes) {
      collectionMapHashes.add(hash)
    }
  }

  const data = (await axios.get<BeatmapHashMap>(`${serverUri}/v2/hashMap`)).data
  const serverHashes = new Map<string, [number, number]>(Object.entries(data))
  const missing: number[] = []
  let totalSize = 0;
  await loadBeatmaps()

  const ownedSetIds = new Set(beatmapIds)

  collectionMapHashes.forEach(hash => {
    if (serverHashes.has(hash)) {
      const [setId, size] = serverHashes.get(hash) ?? [0, 0];

      if (setId && !ownedSetIds.has(setId)) {
        ownedSetIds.add(setId)
        missing.push(setId)
        totalSize += size
      }
    }
  })

  // const totalSize = (await axios.post<number>(`${serverUri}/totalSize`, missing)).data
  return { ids: missing, totalSize }
}
