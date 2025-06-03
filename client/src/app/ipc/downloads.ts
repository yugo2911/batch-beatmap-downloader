import { E, serverUri } from './main';
import { currentQueryResult, currentDownloadDetails } from './query';
import { v4 as uuid } from 'uuid'
import axios from 'axios';
import { DownloadStartV2 } from "@/models/api-v2";
import { Application } from "../application";
import { convertStatus } from "../download/util";
import { StableClient } from "../clients/stable";

export const handleStartDownload = async (event: E, force: boolean, collectionName: string) => {
  const app = Application.instance;

  const { totalSize, totalSizeForce } = currentDownloadDetails;
  const size = force ? totalSizeForce : totalSize;

  const id = currentQueryResult.Id
  const ids = currentQueryResult.SetIds.filter(setId => {
    if (force) return true;
    return !app.client.beatmapSets.has(setId);
  })

  await axios.post(`${serverUri}/v2/metrics/download/start`, {
    Client: app.clientId,
    Id: id,
    SizeRemoved: totalSizeForce - size,
  } as DownloadStartV2)

  void app
    .downloads
    .createDownload(id, ids, size, force, currentQueryResult.Hashes, collectionName)
    .resume();
};

export const handleCreateDownload = (event: E, ids: number[], size: number, force: boolean, hashes: string[], collectionName: string) => {
  void Application.instance.downloads.createDownload(uuid(), ids, size, force, hashes, collectionName).resume();
}

export const handleGetDownloadsStatus = () => Application.instance.downloads.getStatuses().map(convertStatus);
export const handleResumeDownload = (event: E, downloadId: string) => Application.instance.downloads.resume(downloadId);
export const handleResumeDownloads = () => Application.instance.downloads.resumeAll();
export const handlePauseDownload = (event: E, downloadId: string) => Application.instance.downloads.pause(downloadId);
export const handlePauseDownloads = () => Application.instance.downloads.pauseAll();
export const handleDeleteDownload = (event: E, downloadId: string) => Application.instance.downloads.delete(downloadId);

export const handleMoveAllDownloads = async () => {
  const application = Application.instance;
  const client = application.client;

  if (!(client instanceof StableClient)) {
    throw new Error("Only stable client supports this feature");
  }

  await client.moveTempFiles();
};
