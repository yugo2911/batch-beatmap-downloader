import { DownloadStatus } from "@/models/api";

export const convertStatus = (status: DownloadStatus) => ({
  id: status.id,
  paused: status.paused,
  all: status.all.length,
  completed: status.completed.length,
  failed: status.failed.length,
  skipped: status.skipped.length,
  totalSize: status.totalSize,
  totalProgress: status.totalProgress,
  force: status.force,
  speed: status.speed
})
