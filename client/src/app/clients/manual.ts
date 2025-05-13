import { Client } from "./client";

export class ManualClient extends Client {
  loadBeatmaps(): Promise<Set<number>> {
    throw new Error("Method not implemented.");
  }
  isPathValid(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
