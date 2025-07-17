import { useSettings } from "../context/SettingsProvider";
import Button from "@/components/util/Button";

export const LazerWarning = () => {
  const { settings, status } = useSettings();
  if (!settings) return null;
  if (settings.client !== 'lazer') return null;

  return (
    <fieldset className="!bg-orange-300 dark:!bg-orange-700 !border-orange-700">
      <legend>Lazer Warning</legend>

      <div className="flex flex-col">
        <p>Lazer does not automatically import beatmap files</p>

        <p>You have to drag the downloaded maps into the client window</p>
      </div>
      
      {Boolean(status?.stats?.lazerWarningCount) && (
        <div className="flex flex-col items-start gap-2 mt-4">
          <p>Found <span className="font-bold">{status.stats.lazerWarningCount}</span> beatmap(s) that are not imported into the client.</p>
        
          <Button onClick={() => window.electron.open(settings.clientPaths.lazer.downloadPath)}>Open folder</Button>
        </div>
      )}
    </fieldset>
  );
};
