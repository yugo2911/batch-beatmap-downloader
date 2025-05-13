import React from "react";
import Switch from "react-switch";
import { useSettings } from "../context/SettingsProvider";
import { Browse } from "./Browse";
import { NumericInput } from "./util/NumericInput";
import { Tooltip } from "./util/Tooltip";
import classNames from "classnames";
import { useDownload } from "@/render/context/DownloadProvider";

const parallelTooltip = `Advanced: The number of parallel requests made per download.
Increasing this may increase your total download speed.
Increasing is too high can saturate your network or lag your computer.
You must restart (pause and resume) your downloads for this to take effect.
Maximum: 25
`

const clients = [
  { name: "osu!stable", value: "stable" },
  { name: "osu!lazer", value: "lazer" },
  { name: "Manual Folder", value: "manual" }
];

export const Settings = () => {
  const { downloads } = useDownload();
  const { settings, setSetting, setClientSetting } = useSettings();
  if (!settings) return null;

  const {
    darkMode,
    maxConcurrentDownloads,
    client,
    clientPaths,
  } = settings || {};

  const stableSettings = clientPaths.stable;
  const lazerSettings = clientPaths.lazer;
  const manualSettings = clientPaths.manual;

  return (
    <div className="content-box flex flex-col dark:text-white w-full">
      <span className="font-bold text-lg">Settings</span>

      <pre>{JSON.stringify(settings, null, 2)}</pre>

      <div className="flex items-center gap-4 my-4">
        {clients.map(client => (
          <button
            key={client.value}
            className={classNames({
              'box-selector-on': client.value === settings.client,
              'box-selector-off': client.value !== settings.client,
            })}
            onClick={() => setSetting("client", client.value)}
          >
            {client.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {client === 'stable' && (
          <>
            <div className="flex items-center gap-2">
              <span className="w-52">osu!stable Songs Path:</span>
              <Browse path={stableSettings.mainPath} update={() => null} />
              {stableSettings.validPath && <span>{stableSettings.beatmapSetCount} Beatmap Sets Found</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-52">Alt. Songs Path (stable):</span>
              <Switch onChange={(mode) => null} checked={stableSettings.altPathEnabled} />
              {stableSettings.altPathEnabled && <Browse path={stableSettings.altPath} update={() => null} />}
              {stableSettings.altPathEnabled && stableSettings.validPath && <span>({stableSettings.beatmapSetCount} total sets)</span>}
            </div>
          </>
        )}

        {client === 'lazer' && (
          <div className="flex items-center gap-2">
            <span className="w-52">osu!lazer Songs Path:</span>
            <Browse path={lazerSettings.songsPath} update={() => null} />
            {/*{validPath && <span>{beatmapSetCount} Beatmap Sets Found</span>}*/}
          </div>
        )}

        {client === 'manual' && (
          <div className="flex items-center gap-2">
            <span className="w-52">Download Path:</span>
            <Browse path={manualSettings.downloadPath} update={() => null} />
            {/*{validPath && <span>Path is valid</span>}*/}
          </div>
        )}

        {/*<div className="flex items-center gap-2">*/}
        {/*  <span className="w-52">Dark Mode:</span>*/}
        {/*  <Switch onChange={} checked={darkMode} />*/}
        {/*</div>*/}

        <div className="flex items-center gap-2">
          <span className="w-52">Max Concurrent Downloads:</span>
          <Tooltip title={parallelTooltip} />
          <NumericInput
            value={maxConcurrentDownloads}
            onChange={() => null}
            min={1}
            max={25}
          />
        </div>
      </div>
    </div>
  );
};
