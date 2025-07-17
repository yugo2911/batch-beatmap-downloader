import React, {
  useState, createContext, useEffect, PropsWithChildren, useContext,
} from 'react';
import { DownloadStatus, ReportedDownloadStatus } from '../../models/api';

export interface Downloads {
  downloads: ReportedDownloadStatus[]
}

const defaultContext: Downloads = {
  downloads: []
};

export const DownloadsContext = createContext<Downloads>(defaultContext);

const DownloadsProvider: React.FC<PropsWithChildren<any>> = ({ children }) => {
  const [downloads, setDownloads] = useState<ReportedDownloadStatus[]>([])

  useEffect(() => {
    window.electron.getDownloadsStatus().then(setDownloads);
    const cleanup = window.electron.listenForDownloads(setDownloads);
    
    // Cleanup function to remove IPC listeners
    return cleanup;
  }, [])

  return (
    <DownloadsContext.Provider
      value={{ downloads }}
    >
      {children}
    </DownloadsContext.Provider>
  );
};

export const useDownload = () => useContext(DownloadsContext);

export default DownloadsProvider;
