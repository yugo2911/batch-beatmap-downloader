import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { DownloadDetails } from "@/models/api";
import Button from "@/components/util/Button";
import { CircularProgress } from "@mui/material";

interface ManualInputProps {
  onResult: (result: DownloadDetails) => void;
}

export const ManualInput: React.FC<ManualInputProps> = ({ onResult }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const parsedIds = useMemo(() => {
    if (!input.trim()) return [];
    
    const ids = input
      .split(/[,\s]+/)
      .map(id => id.trim())
      .filter(id => id.length > 0)
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id) && id > 0);
    
    return Array.from(new Set(ids)); // Remove duplicates
  }, [input]);

  const handleSubmit = async () => {
    if (parsedIds.length === 0) {
      toast.error("Please enter valid beatmap set IDs");
      return;
    }

    setLoading(true);
    
    try {
      const result = await window.electron.queryManualInput(parsedIds);
      if (typeof result === "string") {
        toast.error(result);
      } else if (result) {
        toast.success(`Manual input successful: ${result.beatmaps} beatmaps found`);
        onResult(result);
      } else {
        toast.error("No data received from manual input");
      }
    } catch (error) {
      toast.error("Failed to process manual input");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 content-box">
      <div className="flex flex-col gap-2">
        <label htmlFor="manual-input" className="font-semibold">
          Beatmap Set IDs
        </label>
        <textarea
          id="manual-input"
          className="dark:bg-monokai-light dark:border-monokai-light2 w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter beatmap set IDs separated by commas or spaces&#10;Example: 123456, 789012, 345678"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {parsedIds.length > 0 ? (
            <span className="text-green-600 dark:text-green-400">
              {parsedIds.length} unique beatmap set{parsedIds.length !== 1 ? 's' : ''} detected
            </span>
          ) : (
            <span>Enter beatmap set IDs to see count</span>
          )}
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <Button 
          className="input-height px-4" 
          color="blue" 
          onClick={handleSubmit} 
          disabled={loading || parsedIds.length === 0}
        >
          Process IDs
        </Button>
        {loading && <CircularProgress size={25} />}
      </div>
    </div>
  );
};
