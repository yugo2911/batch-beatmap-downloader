import { Client } from "../client";

export class LazerClient extends Client {
  loadBeatmaps(): Promise<Set<number>> {
    throw new Error("Method not implemented.");
  }
  isPathValid(): Promise<boolean> {
    return new Promise((res) => res(false));
  }
}
