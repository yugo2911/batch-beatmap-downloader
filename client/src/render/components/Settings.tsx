import React from "react";
import Switch from "react-switch";
import { useSettings } from "../context/SettingsProvider";
import { Browse } from "./Browse";
import { NumericInput } from "./util/NumericInput";
import { Tooltip } from "./util/Tooltip";
import classNames from "classnames";
import { useDownload } from "@/render/context/DownloadProvider";
import Button from "@/components/util/Button";
import { Template } from "@/components/util/Template";
import { YesNo } from "@/components/util/YesNo";

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
  const { settings, setSetting, setClientSetting, status } = useSettings();
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

  const path = client === 'stable' ? stableSettings.mainPath :
    client === 'lazer' ? lazerSettings.songsPath :
    client === 'manual' ? manualSettings.downloadPath : '';

  function getPath() {
    if (client === 'stable') {
      return stableSettings.mainPath;
    } else if (client === 'lazer') {
      return lazerSettings.songsPath;
    } else if (client === 'manual') {
      return manualSettings.downloadPath;
    }
    return '';
  }

  function setPath(newPath: string) {
    if (client === 'stable') {
      setClientSetting('stable', { mainPath: newPath });
    } else if (client === 'lazer') {
      setClientSetting('lazer', { songsPath: newPath });
    } else if (client === 'manual') {
      setClientSetting('manual', { downloadPath: newPath });
    }
  }

  return (
    <fieldset>
      <legend>Settings</legend>

      <Template.Column>
        <label>
          <span>Client</span>

          <Template.InlineRow>
            {clients.map(client => (
              <Button
                key={client.value}
                className={classNames('input-height', {
                  '!bg-monokai-light2': client.value !== settings.client,
                })}
                onClick={() => setSetting("client", client.value)}
              >
                {client.name}
              </Button>
            ))}
          </Template.InlineRow>
        </label>

        <label>
          <span>Path</span>
          <Browse path={path} update={setPath} invalid={status.errors.invalidPath} />
        </label>

        {client === 'stable' && (
          <>
            <label>
              <span>Alt Songs Path</span>
              <YesNo onChange={(mode) => setClientSetting("stable", { "altPathEnabled": mode })} value={stableSettings.altPathEnabled} />
              {stableSettings.altPathEnabled && <Browse path={stableSettings.altPath} update={() => null} />}
              {stableSettings.altPathEnabled && stableSettings.validPath && <span>({stableSettings.beatmapSetCount} total sets)</span>}
            </label>
          </>
        )}

        {client === 'lazer' && (
          <>
          </>
        )}

        {client === 'manual' && (
          <>
          </>
        )}

        <label>
          <Template.InlineRow className="w-52">
            <span className="whitespace-nowrap">Parallel Downloads</span>
            <Tooltip title={parallelTooltip} />
          </Template.InlineRow>
          <div>
            <NumericInput
              value={maxConcurrentDownloads}
              onChange={(value) => setSetting("maxConcurrentDownloads", value)}
              min={1}
              max={25}
            />
          </div>
        </label>
      </Template.Column>
    </fieldset>
  );
};
