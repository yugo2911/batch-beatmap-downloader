import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import { app } from "electron";

export const LAZER_DEFAULT_PATH = "/home/tsubasa/.local/share/osu";

let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;

const initSql = async () => {
  if (!SQL) {
    const wasmPath = app.isPackaged
      ? path.join(process.resourcesPath, "sql-wasm.wasm")
      : path.join(__dirname, "../../render/assets/sql-wasm.wasm");

    SQL = await initSqlJs({
      locateFile: () => wasmPath,
    });
  }
  return SQL;
};

export const checkValidPath = async (osuPath: string): Promise<boolean> => {
  const onlineDbPath = path.join(osuPath, "online.db");
  return fs.existsSync(onlineDbPath);
};

export const getBeatmapSetIds = async (
  osuPath: string,
): Promise<Set<number>> => {
  const onlineDbPath = path.join(osuPath, "online.db");

  console.log("getBeatmapSetIds path:", osuPath, onlineDbPath);

  if (!fs.existsSync(onlineDbPath)) {
    console.log(`online.db not found: ${onlineDbPath}`);
    return new Set();
  }

  try {
    const sql = await initSql();
    console.log("sql init done");
    const fileBuffer = fs.readFileSync(onlineDbPath);
    console.log("fileBuffer size:", fileBuffer.length);
    const db = new sql.Database(fileBuffer);
    console.log("db created");

    const results = db.exec("SELECT beatmapset_id FROM osu_beatmapsets");
    console.log("results:", results.length);
    const ids = new Set<number>();

    if (results.length > 0) {
      for (const row of results[0].values) {
        const id = row[0] as number;
        if (id > 0) {
          ids.add(id);
        }
      }
    }

    console.log("ids count:", ids.size);
    db.close();
    return ids;
  } catch (err) {
    console.error("Failed to read online.db:", err);
    return new Set();
  }
};
