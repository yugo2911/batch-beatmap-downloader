var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  name: () => name,
  shouldBeClosed: () => shouldBeClosed,
  window: () => window
});
module.exports = __toCommonJS(main_exports);
var import_electron4 = require("electron");
var import_electron_is_dev = __toESM(require("electron-is-dev"));
var import_store = __toESM(require("electron-persist-secure/lib/store"));
var import_update_electron_app = require("update-electron-app");
var import_electron_log2 = __toESM(require("electron-log"));

// src/app/ipc/main.ts
var import_electron3 = require("electron");

// src/app/download/DownloadController.ts
var import_axios2 = __toESM(require("axios"));

// src/app/settings.ts
var import_electron_settings = __toESM(require("electron-settings"));
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var getSettings = async () => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  const s = await import_electron_settings.default.get();
  return {
    darkMode: s.darkMode ?? true,
    maxConcurrentDownloads: s.maxConcurrentDownloads ?? 3,
    autoTransfer: s.autoTransfer ?? false,
    client: s.client ?? "stable",
    clientPaths: {
      stable: {
        mainPath: ((_b = (_a = s.clientPaths) == null ? void 0 : _a.stable) == null ? void 0 : _b.mainPath) ?? null,
        altPath: ((_d = (_c = s.clientPaths) == null ? void 0 : _c.stable) == null ? void 0 : _d.altPath) ?? null,
        altPathEnabled: ((_f = (_e = s.clientPaths) == null ? void 0 : _e.stable) == null ? void 0 : _f.altPathEnabled) ?? false,
        tempPath: ((_h = (_g = s.clientPaths) == null ? void 0 : _g.stable) == null ? void 0 : _h.tempPath) ?? null,
        temp: ((_j = (_i = s.clientPaths) == null ? void 0 : _i.stable) == null ? void 0 : _j.temp) ?? false,
        autoTransfer: ((_l = (_k = s.clientPaths) == null ? void 0 : _k.stable) == null ? void 0 : _l.autoTransfer) ?? false,
        validPath: false,
        beatmapSetCount: 0
      },
      lazer: {
        songsPath: "",
        validPath: false,
        beatmapSetCount: 0
      },
      manual: {
        downloadPath: "",
        validPath: false,
        beatmapSetCount: 0
      }
    }
  };
};
var getSongsFolder = async () => {
  const altPathEnabled = await import_electron_settings.default.get("altPathEnabled");
  if (altPathEnabled) {
    const altPath = await import_electron_settings.default.get("altPath");
    return altPath;
  }
  const osuPath = await import_electron_settings.default.get("path");
  return import_path.default.join(osuPath, "Songs");
};
var getDefaultTempPath = async () => {
  const altPathEnabled = await import_electron_settings.default.get("altPathEnabled");
  if (altPathEnabled) return "";
  const osuPath = await import_electron_settings.default.get("path");
  const tempPath = import_path.default.join(osuPath, "bbd-temp");
  if (!import_fs.default.existsSync(tempPath)) {
    import_fs.default.mkdirSync(tempPath);
  }
  return tempPath;
};
var getTempPath = async () => {
  const tempPath = await import_electron_settings.default.get("tempPath");
  if (tempPath) return tempPath;
  return getDefaultTempPath();
};

// src/app/beatmaps.ts
var beatmapIds = /* @__PURE__ */ new Set();
var loadBeatmaps = async () => {
};

// src/app/clients/stable/collection/collection.ts
var import_electron_settings2 = __toESM(require("electron-settings"));
var import_lodash = require("lodash");

// src/app/clients/stable/collection/parse.ts
var import_osu_buffer = require("osu-buffer");
var fs2 = __toESM(require("fs"));

// src/app/clients/stable/collection/utf8.ts
var import_utf8_string_bytes = require("utf8-string-bytes");
var readNameUtf8 = (reader) => {
  const byte = reader.readBytes(1);
  if (byte[0] !== 0) {
    const length = reader.read7bitInt();
    const bytes = reader.readBytes(length);
    return (0, import_utf8_string_bytes.utf8ByteArrayToString)(bytes);
  } else {
    return "";
  }
};
var writeNameUtf8 = (writer, name2) => {
  if (name2 == "") {
    writer.writeUint8(0);
  } else {
    writer.writeUint8(11);
    const bytes = (0, import_utf8_string_bytes.stringToUtf8ByteArray)(name2);
    writer.write7bitInt(bytes.length);
    writer.writeBytes(bytes);
  }
};

// src/app/clients/stable/collection/parse.ts
var import_utf8_string_bytes2 = require("utf8-string-bytes");
var readCollections = async (path5) => {
  const buffer = await fs2.promises.readFile(path5 + "\\collection.db");
  const reader = new import_osu_buffer.OsuReader(buffer.buffer);
  const collections = {
    version: reader.readInt32(),
    numberCollections: reader.readInt32(),
    collections: []
  };
  for (let colIdx = 0; colIdx < collections.numberCollections; colIdx++) {
    const collection = {
      name: readNameUtf8(reader),
      numberMaps: reader.readInt32(),
      hashes: []
    };
    for (let mapIdx = 0; mapIdx < collection.numberMaps; mapIdx++) {
      collection.hashes.push(reader.readString() ?? "");
    }
    collections.collections.push(collection);
  }
  return collections;
};
var writeCollections = async (osuPath, collections) => {
  let writer;
  try {
    const length = calculateLength(collections);
    const arrayBuffer = new ArrayBuffer(length);
    writer = new import_osu_buffer.OsuWriter(arrayBuffer);
    writer.writeInt32(collections.version);
    writer.writeInt32(collections.numberCollections);
    collections.collections.forEach((collection) => {
      writeNameUtf8(writer, collection.name);
      writer.writeInt32(collection.numberMaps);
      collection.hashes.forEach((hash) => {
        writer.writeString(hash);
      });
    });
    const buffer = Buffer.from(writer.buff);
    const path5 = osuPath + "/collection.db";
    await fs2.promises.writeFile(path5, buffer);
  } catch (err) {
    console.log(err);
  }
};
var calculateLength = (collections) => {
  let count = 8;
  collections.collections.forEach((collection) => {
    if (collection.name == "") {
      count += 1;
    } else {
      count += (0, import_utf8_string_bytes2.stringToUtf8ByteArray)(collection.name).length + 2;
    }
    count += 4;
    count += 34 * collection.numberMaps;
  });
  return count;
};

// src/app/clients/stable/collection/collection.ts
var import_axios = __toESM(require("axios"));
var addCollection = async (hashes, name2) => {
  var _a;
  const osuPath = await import_electron_settings2.default.get("path");
  const backup = await readCollections(osuPath);
  const newCollections = (0, import_lodash.cloneDeep)(backup);
  newCollections.collections.push({
    name: name2,
    numberMaps: hashes.length,
    hashes
  });
  newCollections.numberCollections++;
  await writeCollections(osuPath, newCollections);
  const testWrite = await readCollections(osuPath);
  if (testWrite.numberCollections !== newCollections.numberCollections) {
    (_a = window) == null ? void 0 : _a.webContents.send("error", "Something went wrong when creating the new collection. Backup was restored.");
    await writeCollections(osuPath, backup);
  }
};

// src/app/download/binary.ts
var import_electron_log = __toESM(require("electron-log"));
var import_os = __toESM(require("os"));
var import_electron = require("electron");
var import_nodejs_file_downloader = __toESM(require("nodejs-file-downloader"));
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));
var import_crypto = __toESM(require("crypto"));
var generateChecksum = (path5) => {
  return new Promise((resolve, reject) => {
    const hash = import_crypto.default.createHash("sha256");
    const input = import_fs2.default.createReadStream(path5);
    input.on("error", reject);
    input.on("data", (chunk) => {
      hash.update(chunk);
    });
    input.on("close", () => {
      resolve(hash.digest("hex"));
    });
  });
};
var downloadBinary = async (fileName, checksum) => {
  const appPath = import_electron.app.getPath("userData");
  const binaryPath2 = import_path2.default.join(appPath, fileName);
  const exists = import_fs2.default.existsSync(binaryPath2);
  if (exists) return binaryPath2;
  const dl = new import_nodejs_file_downloader.default({
    url: `https://direct.nzbasic.com/${fileName}`,
    directory: appPath,
    fileName
  });
  await dl.download();
  const calculated = await generateChecksum(binaryPath2);
  if (calculated !== checksum) {
    import_fs2.default.rmSync(binaryPath2);
    import_electron_log.default.error("Download binary checksum mismatch");
    throw new Error("Checksum mismatch");
  }
  import_fs2.default.chmodSync(binaryPath2, 493);
  return binaryPath2;
};
var getBinaryAndHash = (platform, arch) => {
  if (platform === "win32" && arch === "x64") return ["download-windows-amd64.exe", "3aaa362e795acf7a5986dea555c4c617343c79ba154955c59445d40d4c9e7894"];
  if (platform === "win32" && arch === "x32") return ["download-windows-386.exe", "9a99404d4c74c61c2f8ed1a47ba5b76ff8873b118c96c6a1b62ef4c7515f6e3f"];
  if (platform === "linux" && arch === "x64") return ["download-linux-amd64", "198f8f946d0cc665947603222f81bbdfb1f4a1b93f95f025e3f43097a3a8a6ec"];
  if (platform === "linux" && arch === "x32") return ["download-linux-386", "42ea1f97c7832eb3a512cca11b71aa4e69527b7fadcb1ba79c0d09ab68e27b98"];
  if (platform === "darwin" && arch === "x64") return ["download-darwin-amd64", "1a51836663af154b5b315028c7a2c3982f792e987a5e995537ac666c56bb43c1"];
  if (platform === "darwin" && arch === "x32") return ["download-darwin-386", "374e046aba93d90564bbce32c850534d29a46d48571c6b56772ff5d71df6bf8d"];
  import_electron_log.default.error("Unsupported platform", platform, arch);
  throw new Error("Unsupported platform");
};
var binaryPath = new Promise((res) => {
  const platform = import_os.default.platform();
  const arch = import_os.default.arch();
  const [name2, hash] = getBinaryAndHash(platform, arch);
  downloadBinary(name2, hash).then(res);
});

// src/app/download/ipc.ts
var import_ipc_node_go = __toESM(require("ipc-node-go"));
var DownloadIPC = class {
  binary = new Promise((res) => {
    binaryPath.then(() => res());
  });
  ipc;
  queue = [];
  available = true;
  constructor() {
    binaryPath.then((path5) => {
      this.ipc = new import_ipc_node_go.default(path5);
      this.ipc.on("log", console.log);
      this.ipc.on("available", () => {
        const request = this.queue.shift();
        if (!request) return this.available = true;
        this.ipc.send("download", request);
      });
      this.ipc.init();
    });
  }
  async download(setId, out, index = 0) {
    const request = {
      setId,
      out,
      index
    };
    await this.binary;
    if (this.available) {
      this.available = false;
      this.ipc.send("download", request);
    } else {
      this.queue.push(request);
    }
    return new Promise((res, rej) => {
      this.ipc.on(setId, (data, err) => {
        if (err) rej(err);
        res(data);
      });
    });
  }
  close() {
    this.ipc.kill();
  }
};

// src/app/download/DownloadController.ts
var import_fs4 = __toESM(require("fs"));
var import_path3 = __toESM(require("path"));

// src/app/clients/client.ts
var Client = class {
  path;
  getPath() {
    return this.path;
  }
  setPath(path5) {
    this.path = path5;
  }
};

// src/app/clients/stable/index.ts
var import_fs3 = __toESM(require("fs"));
var import_os2 = __toESM(require("os"));
var StableClient = class extends Client {
  async loadSettings() {
    const s = await getSettings();
  }
  async isPathValid() {
    try {
      const files = await import_fs3.default.promises.readdir(this.getPath());
      if (!files.includes("collection.db")) return false;
    } catch (err) {
      return false;
    }
    return true;
  }
  async loadBeatmaps() {
    const s = await getSettings();
    const path5 = s.clientPaths.stable.mainPath;
    try {
      const dir = await import_fs3.default.promises.readdir(path5);
      const ids = dir.map((file) => {
        const number = /^\d+/.exec(file);
        return number ? parseInt(number[0]) : 0;
      });
      return new Set(ids);
    } catch (err) {
      console.log(err);
      return /* @__PURE__ */ new Set();
    }
  }
  checkValidTempPath(tempPath, songsPath) {
    const platform = import_os2.default.platform();
    if (platform !== "win32") return false;
    const songsDrive = songsPath.split(":")[0];
    const tempDrive = tempPath.split(":")[0];
    return songsDrive === tempDrive;
  }
  async getTempPathDetails() {
    const s = await getSettings();
    const tempEnabled = s.clientPaths.stable.temp;
    const tempAuto = s.clientPaths.stable.autoTransfer;
    const tempPath = s.clientPaths.stable.tempPath;
    const exists = tempPath ? await import_fs3.default.promises.access(tempPath).then(() => true).catch(() => false) : false;
    const files = exists ? await import_fs3.default.promises.readdir(tempPath) : [];
    const valid = exists ? await checkValidTempPath(tempPath) : false;
    return {
      valid,
      enabled: tempEnabled ?? false,
      path: tempPath,
      count: files.filter((file) => file.endsWith(".osz")).length,
      auto: tempAuto ?? false
    };
  }
};

// src/app/download/DownloadController.ts
var DownloadController = class {
  ids = [];
  force = false;
  hashes = [];
  status;
  startTime;
  downloadedSinceResume = 0;
  downloadPath;
  concurrentDownloads = 3;
  id;
  toDownload = [];
  interval;
  ipc;
  constructor(id, ids, size, force, hashes) {
    this.id = id;
    this.ids = ids;
    this.force = force;
    this.hashes = hashes;
    this.status = {
      id,
      paused: true,
      all: ids,
      completed: [],
      failed: [],
      skipped: [],
      totalSize: size,
      totalProgress: 0,
      force,
      speed: 0
    };
  }
  getId() {
    return this.id;
  }
  getIds() {
    return this.ids;
  }
  removeIds(ids) {
    this.ids = this.ids.filter((id) => !ids.includes(id));
    this.status.all = this.ids;
    setDownloadStatus(this);
    emitStatus();
  }
  async createCollection(collectionName) {
    await addCollection(this.hashes, collectionName);
  }
  setStatus(status) {
    this.status = status;
  }
  getStatus() {
    return this.status;
  }
  setConcurrentDownloads(number) {
    this.concurrentDownloads = number;
  }
  async resume(client, settings5) {
    this.ipc = new DownloadIPC();
    this.startTime = /* @__PURE__ */ new Date();
    this.downloadedSinceResume = 0;
    this.status.paused = false;
    emitStatus();
    this.concurrentDownloads = settings5.maxConcurrentDownloads;
    this.updateDownload("resume");
    const beatmaps = await client.loadBeatmaps();
    const newIds = this.ids.filter((id) => {
      return !this.status.completed.includes(id) && !this.status.skipped.includes(id) && !this.status.failed.includes(id);
    });
    const skipped = [];
    this.toDownload = newIds.filter((id) => {
      if (this.force) return true;
      const hasMap = beatmaps.has(id);
      if (hasMap) skipped.push(id);
      return !hasMap;
    });
    if (!this.status.skipped.length) this.status.skipped = skipped;
    const downloads = [];
    for (let i = 0; i < this.concurrentDownloads; i++) {
      downloads.push(this.downloadBeatmapSet(i));
    }
    const results = await Promise.all(downloads);
    for (const result of results) {
      if (result === 0 /* FINISHED */) {
        this.status.totalProgress = this.status.totalSize;
        emitStatus();
      }
    }
    if (!this.status.paused) this.updateDownload("delete");
    await setDownloadStatus(this);
    if (this.ipc) this.ipc.close();
    if (client instanceof StableClient) {
      const enabled = settings5.clientPaths.stable.temp;
      const autoTemp = settings5.clientPaths.stable.autoTemp;
      if (enabled && autoTemp) await this.moveTempFiles();
    }
  }
  async moveTempFiles() {
    const tempPath = await getTempPath();
    const songsPath = await getSongsFolder();
    const files = await import_fs4.default.promises.readdir(tempPath);
    for (const set of this.status.all) {
      const oldPath = import_path3.default.join(tempPath, `${set}.osz`);
      const newPath = import_path3.default.join(songsPath, `${set}.osz`);
      await import_fs4.default.promises.rename(oldPath, newPath);
    }
    await Promise.all(files.map((file) => {
      if (!file.endsWith(".osz")) return;
      const setId = parseInt(file.split(".osz")[0]);
      if (!this.status.all.includes(setId)) return;
      const oldPath = import_path3.default.join(tempPath, file);
      const newPath = import_path3.default.join(songsPath, file);
      return import_fs4.default.promises.rename(oldPath, newPath);
    })).catch((err) => {
      var _a;
      (_a = window) == null ? void 0 : _a.webContents.send("error", err);
    });
  }
  async postData(url, body) {
    try {
      await import_axios2.default.post(url, body);
    } catch (err) {
      if (err instanceof Error) {
        this.handleServerError(err);
      }
    }
  }
  updateDownload(type) {
    this.postData(`${serverUri}/v2/metrics/download/update`, {
      Client: clientId,
      Id: this.id,
      Type: type
    });
  }
  pause() {
    this.status.paused = true;
    emitStatus();
    this.updateDownload("pause");
    if (this.ipc) this.ipc.close();
  }
  getDownloadSpeed() {
    const elapsed = (/* @__PURE__ */ new Date()).getTime() - this.startTime.getTime();
    return this.downloadedSinceResume / 1024 / 1024 / (elapsed / 1e3);
  }
  handleServerError(err) {
    var _a, _b;
    if (err.message.includes("502")) {
      this.pause();
      (_a = window) == null ? void 0 : _a.webContents.send("error", "Server is down");
      (_b = window) == null ? void 0 : _b.webContents.send("server-down", true);
      this.interval = setInterval(() => {
        import_axios2.default.get(`${serverUri}/api`).then((res) => {
          var _a2;
          if (res.status >= 200 && res.status <= 299) {
            (_a2 = window) == null ? void 0 : _a2.webContents.send("server-down", false);
            this.resume();
            clearInterval(this.interval);
          }
        });
      }, 1e3);
    }
  }
  getNextSetId() {
    return this.toDownload.shift();
  }
  async downloadBeatmapSet(index, client) {
    if (shouldBeClosed) return 1 /* PAUSED */;
    if (this.status.paused) return 1 /* PAUSED */;
    const setId = this.getNextSetId();
    if (setId === void 0) return 0 /* FINISHED */;
    const path5 = client.getPath();
    try {
      const before = /* @__PURE__ */ new Date();
      const res = await this.ipc.download(setId.toString(), path5, index);
      const after = /* @__PURE__ */ new Date();
      const difference = after.getTime() - before.getTime();
      beatmapIds.add(setId);
      this.status.completed.push(setId);
      this.status.totalProgress += res.Size;
      this.downloadedSinceResume += res.Size;
      const speed = this.getDownloadSpeed();
      this.status.speed = speed;
      this.postData(`${serverUri}/v2/metrics/download/beatmap`, {
        Client: clientId,
        Id: this.id,
        SetId: setId.toString(),
        Time: difference / Math.max(this.concurrentDownloads, 1)
      });
    } catch (err) {
      console.log(setId, "failed");
      this.status.failed.push(setId);
      if (err instanceof Error) {
        this.handleServerError(err);
      }
    }
    emitStatus();
    return this.downloadBeatmapSet(index);
  }
};

// src/app/download/downloads.ts
var downloadMap = /* @__PURE__ */ new Map();
var getDownload = (downloadId) => {
  return downloadMap.get(downloadId);
};
var convertStatus = (status) => ({
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
});
var emitStatus = () => {
  var _a;
  const statuses = getDownloadsStatus();
  const mapped = statuses.map(convertStatus);
  (_a = window) == null ? void 0 : _a.webContents.send("downloads-status", mapped);
};
var createDownload = (id, ids, size, force, hashes, collectionName) => {
  downloadMap.forEach((download2) => {
    download2.removeIds(ids);
  });
  const download = new DownloadController(id, ids, size, force, hashes);
  if (collectionName) {
    download.createCollection(collectionName);
  }
  downloadMap.set(id, download);
  setDownloadStatus(download);
  return download;
};
var getDownloadsStatus = () => {
  return Array.from(downloadMap.values()).map((download) => download.getStatus());
};
var pauseDownload = (downloadId) => {
  const download = getDownload(downloadId);
  if (download) download.pause();
};
var pauseDownloads = () => {
  downloadMap.forEach((download) => download.pause());
};
var resumeDownload = (downloadId) => {
  const download = getDownload(downloadId);
  if (download) download.resume();
};
var resumeDownloads = () => {
  downloadMap.forEach((download) => {
    download.resume();
  });
};
var deleteDownload = async (downloadId) => {
  const download = getDownload(downloadId);
  if (download) {
    download.pause();
    download.updateDownload("delete");
  }
  downloadMap.delete(downloadId);
  await unsetDownload(downloadId);
  emitStatus();
};

// src/app/download/settings.ts
var import_electron_settings3 = __toESM(require("electron-settings"));
var import_uuid = require("uuid");
var clientId;
var downloadToStatus = (download) => {
  const status = download.getStatus();
  const id = download.getId();
  return {
    id,
    all: status.all,
    completed: status.completed,
    skipped: status.skipped,
    failed: status.failed,
    totalSize: status.totalSize,
    totalProgress: status.totalProgress,
    force: status.force
  };
};
var setDownloadStatus = async (download) => {
  const status = downloadToStatus(download);
  await import_electron_settings3.default.set(`downloads.${status.id}.status`, status);
};
var setAllDownloadStatus = async () => {
  const downloads = Array.from(downloadMap.values());
  for (const download of downloads) {
    await setDownloadStatus(download);
  }
};
var loadClientId = async () => {
  clientId = await import_electron_settings3.default.get("clientId");
  if (!clientId) {
    const newClientId = (0, import_uuid.v4)();
    await import_electron_settings3.default.set("clientId", newClientId);
    clientId = newClientId;
  }
};
var loadDownloads = async () => {
  const storedDownloads = await import_electron_settings3.default.get("downloads");
  if (typeof storedDownloads !== "object") return;
  if (storedDownloads === null) return;
  const downloads = storedDownloads;
  if (downloads) {
    const keys = Object.keys(downloads);
    for (const key of keys) {
      const download = downloads[key].status;
      if (download.all === void 0 || download.completed === void 0 || download.failed === void 0 || download.skipped === void 0) {
        console.log("bad download", download.id);
        continue;
      }
      const remaining = download.all.length - download.completed.length - download.failed.length - download.skipped.length;
      if (remaining === 0) {
        unsetDownload(key);
        continue;
      }
      const ids = download.all;
      const size = download.totalSize;
      const force = download.force;
      const hashes = [];
      const collectionName = "";
      const dl = createDownload(key, ids, size, force, hashes, collectionName);
      dl.setStatus({
        ...dl.getStatus(),
        completed: download.completed,
        failed: download.failed,
        skipped: download.skipped,
        totalProgress: download.totalProgress
      });
    }
  }
};
var unsetDownload = (downloadId) => {
  return import_electron_settings3.default.unset(`downloads.${downloadId}`);
};

// src/app/ipc/query.ts
var import_axios3 = __toESM(require("axios"));
var currentQueryResult;
var currentDownloadDetails;
var handleQuery = async (event, node, limit, order) => {
  const body = { node, ...order, clientId };
  if (limit) {
    body.limit = limit;
  }
  const res = (await import_axios3.default.post(`${serverUri}/v2/filter`, body)).data;
  currentQueryResult = res;
  await loadBeatmaps();
  let totalSize = 0;
  let totalSizeForce = 0;
  let sets = 0;
  const setsForce = res.SetIds.length;
  const beatmaps = res.Ids.length;
  const map = new Map(Object.entries(res.SizeMap));
  map.forEach((size, setIdString) => {
    const setId = Number(setIdString);
    totalSizeForce += size;
    if (!beatmapIds.has(setId)) {
      totalSize += size;
      sets++;
    }
  });
  currentDownloadDetails = {
    totalSize,
    totalSizeForce,
    sets,
    setsForce,
    beatmaps
  };
  return currentDownloadDetails;
};
var handleGetMetrics = async () => {
  try {
    const res = await import_axios3.default.get(`${serverUri}/v2/metrics`);
    if (res.status !== 200) {
      return [false, null];
    } else {
      return [true, res.data];
    }
  } catch (err) {
    return [false, null];
  }
};
var handleGetBeatmapDetails = async (event, page, pageSize) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const ids = currentQueryResult.Ids.slice(start, end);
  return (await import_axios3.default.post(`${serverUri}/beatmapDetails`, ids)).data;
};

// src/app/ipc/downloads.ts
var import_uuid2 = require("uuid");
var import_axios4 = __toESM(require("axios"));
var import_fs5 = __toESM(require("fs"));
var import_path4 = __toESM(require("path"));
var handleStartDownload = async (event, force, collectionName) => {
  const { totalSize, totalSizeForce } = currentDownloadDetails;
  const size = force ? totalSizeForce : totalSize;
  const id = currentQueryResult.Id;
  const ids = currentQueryResult.SetIds.filter((setId) => {
    if (force) return true;
    return !beatmapIds.has(setId);
  });
  await import_axios4.default.post(`${serverUri}/v2/metrics/download/start`, {
    Client: clientId,
    Id: id,
    SizeRemoved: totalSizeForce - size
  });
  const download = createDownload(id, ids, size, force, currentQueryResult.Hashes, collectionName);
  download.resume();
};
var handleCreateDownload = (event, ids, size, force, hashes, collectionName) => {
  const id = (0, import_uuid2.v4)();
  const download = createDownload(id, ids, size, force, hashes, collectionName);
  download.resume();
};
var handleGetDownloadsStatus = () => {
  return getDownloadsStatus().map(convertStatus);
};
var handleResumeDownload = (event, downloadId) => resumeDownload(downloadId);
var handleResumeDownloads = resumeDownloads;
var handlePauseDownload = (event, downloadId) => pauseDownload(downloadId);
var handlePauseDownloads = pauseDownloads;
var handleDeleteDownload = (event, downloadId) => deleteDownload(downloadId);
var handleMoveAllDownloads = async () => {
  const tempPath = await getTempPath();
  const songsPath = await getSongsFolder();
  const files = await import_fs5.default.promises.readdir(tempPath);
  await Promise.all(files.map((file) => {
    if (!file.endsWith(".osz")) return;
    const oldPath = import_path4.default.join(tempPath, file);
    const newPath = import_path4.default.join(songsPath, file);
    return import_fs5.default.promises.rename(oldPath, newPath);
  }));
};

// src/app/ipc/settings.ts
var import_electron_settings4 = __toESM(require("electron-settings"));
var handleGetSettings = getSettings;
var handleSetSettings = (event, s) => import_electron_settings4.default.set(s);

// src/app/ipc/os.ts
var import_electron2 = require("electron");
var import_os3 = __toESM(require("os"));
var handleBrowse = async () => {
  return await import_electron2.dialog.showOpenDialog({
    properties: ["openDirectory"]
  });
};
var handleGetPlatform = () => import_os3.default.platform();

// src/app/ipc/main.ts
var serverUri = "https://v2.nzbasic.com";
loadDownloads();
loadClientId();
import_electron3.ipcMain.on("quit", () => import_electron3.app.quit());
import_electron3.ipcMain.handle("get-version", () => import_electron3.app.getVersion());
import_electron3.ipcMain.handle("start-download", handleStartDownload);
import_electron3.ipcMain.handle("get-downloads-status", handleGetDownloadsStatus);
import_electron3.ipcMain.handle("create-download", handleCreateDownload);
import_electron3.ipcMain.handle("resume-download", handleResumeDownload);
import_electron3.ipcMain.handle("resume-downloads", handleResumeDownloads);
import_electron3.ipcMain.handle("pause-download", handlePauseDownload);
import_electron3.ipcMain.handle("pause-downloads", handlePauseDownloads);
import_electron3.ipcMain.handle("delete-download", handleDeleteDownload);
import_electron3.ipcMain.handle("move-all-downloads", handleMoveAllDownloads);
import_electron3.ipcMain.handle("get-settings", handleGetSettings);
import_electron3.ipcMain.handle("set-settings", handleSetSettings);
import_electron3.ipcMain.handle("query", handleQuery);
import_electron3.ipcMain.handle("get-metrics", handleGetMetrics);
import_electron3.ipcMain.handle("get-beatmap-details", handleGetBeatmapDetails);
import_electron3.ipcMain.handle("browse", handleBrowse);
import_electron3.ipcMain.handle("get-platform", handleGetPlatform);

// src/main.ts
(0, import_update_electron_app.updateElectronApp)({ logger: import_electron_log2.default });
if (require("electron-squirrel-startup")) {
  import_electron4.app.quit();
}
var createStores = () => {
  new import_store.default({
    configName: "config"
    // The stores name
  });
};
var window;
var name = "james";
var shouldBeClosed = false;
var createWindow = () => {
  const mainWindow = new import_electron4.BrowserWindow({
    height: 720,
    width: 1280,
    minHeight: 720,
    minWidth: 1280,
    title: "Batch Beatmap Downloader",
    icon: "./render/assets/bbd.ico",
    backgroundColor: "#fff",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  });
  mainWindow.setMenuBarVisibility(false);
  window = mainWindow;
  window.on("close", (e) => {
    e.preventDefault();
    pauseDownloads();
    setAllDownloadStatus().then(() => import_electron4.app.quit());
  });
  window.on("closed", () => {
    import_electron4.app.quit();
    window = null;
  });
  if (import_electron_is_dev.default) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};
import_electron4.app.on("activate", () => {
  import_electron4.app.disableHardwareAcceleration();
});
import_electron4.app.on("ready", () => {
  createStores();
  createWindow();
  import_electron4.nativeTheme.themeSource = "dark";
});
import_electron4.app.once("before-quit", () => {
  window == null ? void 0 : window.removeAllListeners();
});
import_electron4.app.on("window-all-closed", () => {
  shouldBeClosed = true;
  window == null ? void 0 : window.removeAllListeners();
  import_electron4.app.exit();
});
import_electron4.app.on("activate", () => {
  if (import_electron4.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
import_electron4.app.on("web-contents-created", (e, contents) => {
  if (contents.getType() == "webview") {
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  name,
  shouldBeClosed,
  window
});
