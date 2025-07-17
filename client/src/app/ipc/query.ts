import axios from "axios";
import { Node } from "@/models/filter";
import { BeatmapDetails, DownloadDetails, QueryOrder } from "@/models/api";
import { E, serverUri } from "./main";
import { MetricsV2 } from "@/models/metrics";
import { FilterResponseV2 } from "@/models/api-v2";
import { Application } from "../application";

export let currentQueryResult: FilterResponseV2;
export let currentDownloadDetails: DownloadDetails;

export const handleQuery = async (event: E, node: Node, limit?: number, order?: QueryOrder): Promise<DownloadDetails> => {
  const clientId = Application.instance.clientId;
  const body: { node: Node; by?: string; direction?: string; limit?: number; clientId: string } = { node, ...order, clientId }
  if (limit) {
    body.limit = limit;
  }

  const res = (await axios.post<FilterResponseV2>(`${serverUri}/v2/filter`, body)).data
  currentQueryResult = res;

  const client = Application.instance.client;

  await client.loadBeatmaps();
  let totalSize = 0;
  let totalSizeForce = 0;
  let sets = 0;
  const setsForce = res.SetIds.length;
  const beatmaps = res.Ids.length;

  const map = new Map<string, number>(Object.entries(res.SizeMap));
  map.forEach((size, setIdString) => {
    const setId = Number(setIdString);
    totalSizeForce += size;

    if (!client.beatmapSets.has(setId)) {
      totalSize += size;
      sets++;
    }
  })

  currentDownloadDetails = {
    totalSize,
    totalSizeForce,
    sets,
    setsForce,
    beatmaps,
  }

  return currentDownloadDetails
};

export const handleGetMetrics = async () => {
  try {
    const res = await axios.get<MetricsV2>(`${serverUri}/v2/metrics`);
    if (res.status !== 200) {
      return [false, null]
    } else {
      return [true, res.data]
    }
  } catch(err) {
    return [false, null]
  }
};

export const handleGetBeatmapDetails = async (event: E, page: number, pageSize: number) => {
  // page is 1 indexed, find Ids
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const ids = currentQueryResult.Ids.slice(start, end);

  return (
    await axios.post<BeatmapDetails[]>(`${serverUri}/beatmapDetails`, ids)
  ).data;
};

export const handleQueryManualInput = async (event: E, setIds: number[]): Promise<DownloadDetails> => {
  const clientId = Application.instance.clientId;
  
  // For now, we'll create a simple implementation that assumes a fixed size per set
  // This can be improved later to get actual sizes from the server
  const AVERAGE_SET_SIZE = 10 * 1024 * 1024; // 10MB average per set
  
  // Create a mock FilterResponseV2 with the provided set IDs
  const mockSizeMap = new Map<number, number>();
  const mockHashes: string[] = [];
  
  // Generate mock data for each set ID
  setIds.forEach(setId => {
    mockSizeMap.set(setId, AVERAGE_SET_SIZE);
    // Create mock hashes (we'll generate simple ones for now)
    mockHashes.push(`mock-hash-${setId}`);
  });
  
  const mockResponse: FilterResponseV2 = {
    Id: `manual-${Date.now()}`,
    SetIds: setIds,
    Ids: setIds, // For manual input, we treat set IDs as beatmap IDs
    Hashes: mockHashes,
    SizeMap: mockSizeMap
  };
  
  currentQueryResult = mockResponse;

  const client = Application.instance.client;
  await client.loadBeatmaps();
  
  let totalSize = 0;
  let totalSizeForce = 0;
  let sets = 0;
  const setsForce = setIds.length;
  const beatmaps = setIds.length; // Each set ID represents one beatmap set

  mockSizeMap.forEach((size, setId) => {
    totalSizeForce += size;

    if (!client.beatmapSets.has(setId)) {
      totalSize += size;
      sets++;
    }
  });

  currentDownloadDetails = {
    totalSize,
    totalSizeForce,
    sets,
    setsForce,
    beatmaps,
  }

  return currentDownloadDetails;
};
