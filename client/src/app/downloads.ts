import { DownloadController } from "./download/DownloadController";
import { DownloadStatus } from "@/models/api";
import { SettingsService } from "./settings";
import { Client } from "./clients/client";
import { Application } from "./application";

export class DownloadsService {
  private settingsService: SettingsService;
  private client: Client;
  private downloads: Map<string, DownloadController>;

  constructor(settingsService: SettingsService, client: Client) {
    this.downloads = new Map<string, DownloadController>();
    this.settingsService = settingsService;
    this.client = client;
    this.loadDownloads();
  }

  public setClient(client: Client) {
    this.client = client;
  }

  private loadDownloads() {
    const storedDownloads = this.settingsService.get("downloads");
    if (typeof storedDownloads !== "object") return;
    if (storedDownloads === null) return;
    const downloads = storedDownloads as { [key: string]: { status: DownloadStatus } };

    if (downloads) {
      const keys = Object.keys(downloads);

      for (const key of keys) {
        const download = downloads[key].status;
        if (download.all === undefined || download.completed === undefined || download.failed === undefined || download.skipped === undefined) {
          console.log('bad download', download.id)
          continue;
        }

        const remaining = download.all.length - download.completed.length - download.failed.length - download.skipped.length
        if (remaining === 0) {
          this.unset(key)
          continue;
        }

        const ids = download.all;
        const size = download.totalSize;
        const force = download.force
        const hashes = [] as string[];
        const collectionName = ""
        const dl = this.createDownload(key, ids, size, force, hashes, collectionName)
        dl.setStatus({
          ...dl.getStatus(),
          completed: download.completed,
          failed: download.failed,
          skipped: download.skipped,
          totalProgress: download.totalProgress
        })
      }
    }
  }

  public createDownload(
    id: string,
    ids: number[],
    size: number,
    force: boolean,
    hashes: string[],
    collectionName?: string
  ): DownloadController {
    const download = new DownloadController(id, ids, size, force, hashes);
    this.downloads.set(id, download);
    this.setStatus(id, download.getStatus());

    if (collectionName && this.client.supportsCollections()) {
      void this.client.createCollection(collectionName, hashes);
    }

    return download;
  }

  public setStatus(id: string, status: DownloadStatus) {
    this.settingsService.dangerousSet(`downloads.${id}.status`, status);
  }

  private unset(id: string) {
    this.settingsService.dangerousUnset(`downloads.${id}`);
  }

  public remove(id: string) {
    const download = this.downloads.get(id);
    if (download) {
      this.downloads.delete(id);
      this.unset(id);
    }
  }

  public pause(id: string) {
    const download = this.downloads.get(id);
    if (download) {
      download.pause();
      this.setStatus(id, download.getStatus());
    }
  }

  public pauseAll() {
    for (const download of this.downloads.values()) {
      download.pause();
      this.setStatus(download.getId(), download.getStatus());
    }
  }

  public resume(id: string) {
    const download = this.downloads.get(id);
    if (download) {
      void download.resume();
      this.setStatus(id, download.getStatus());
    }
  }

  public resumeAll() {
    for (const download of this.downloads.values()) {
      void download.resume();
      this.setStatus(download.getId(), download.getStatus());
    }
  }

  public delete(id: string) {
    const download = this.downloads.get(id);
    if (download) {
      download.pause()
      download.updateDownload('delete')
      this.downloads.delete(id)
    }

    this.unset(id)
    Application.instance.emitDownloadStatus();
  }

  public getStatuses(): DownloadStatus[] {
    return Array.from(this.downloads.values()).map((download) => download.getStatus());
  }
}
