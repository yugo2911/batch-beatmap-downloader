import React, { useState } from "react";
import { cloneDeep } from "lodash";
import { toast } from "react-toastify";
import ReactDOM, { createPortal } from "react-dom";
import { CircularProgress } from "@mui/material";
import { createRoot } from "react-dom/client";

import { sampleTree } from "@/models/filter";
import { RuleType } from "@/models/rules";
import { Node, Group } from "@/models/filter";
import { Settings } from "@/components/Settings";
import { DownloadDetails, QueryOrder } from "@/models/api";
import { useStickyState } from "@/hooks/useStickyState";
import { DownloadSettings } from "@/components/DownloadSettings";
import { InvalidPath } from "@/components/InvalidPath";
import { SimpleFilter } from "@/components/query/SimpleFilter";
import { AdvancedFilter } from "@/components/query/AdvancedFilter";
import { ManualInput } from "@/components/query/ManualInput";
import Button from "@/components/util/Button";
import { treeIsCompatibleWithSimpleMode } from "@/models/simple";
import { QuerySettings } from "@/components/query/QuerySettings";
import { useSettings } from "@/context/SettingsProvider";
import { ResultTable } from "@/components/query/ResultTable";

const modes = ['simple', 'advanced', 'manual'] as const;

export const Query = () => {
  const { status } = useSettings()
  const [tree, setTree] = useStickyState<Node>(sampleTree, "tree");
  const [result, setResult] = useState<DownloadDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState<number>();
  const [order, setOrder] = useState<QueryOrder>();
  const [mode, setMode] = useStickyState<'simple' | 'advanced' | 'manual'>('simple', 'query-mode');
  const [migrateModal, setMigrateModal] = useState(false);

  const exportData = async () => {
    setResult(null);
    setLoading(true);

    const map: Record<RuleType, string> = {
      0: "Text",
      1: "Numeric",
      2: "Text",
      3: "Text",
      4: "Text",
      5: "Text",
      6: "Numeric",
      7: "Numeric",
      8: "Text",
      9: "Numeric",
      10: "Numeric",
    };

    // replace all rule types with the correct string from the Map
    const replaceRuleType = (node: Node) => {
      if ("rule" in node) {
        if (!node.rule) return
        node.rule.type = map[node.rule.type as RuleType];
        if (node.rule.field === "LastUpdate") {
          node.rule.value = node.rule.value.slice(0, -3)
        }

        if (node.rule.field === "Special") {
          node.rule.field = node.rule.value;
          node.rule.value = "1"
        }
      }
      if ("group" in node) {
        if (!node.group) return
        node.group.children.forEach(replaceRuleType);
      }
    };

    const clone = cloneDeep(tree);
    replaceRuleType(clone);
    const res = await window.electron.query(clone, limit, order);
    if (!res) return

    if (typeof res === "string") {
      toast.error(res);
    } else {
      toast.success(`Query successful: ${res.beatmaps} results`);
      setResult(res);
    }

    setLoading(false);
  };

  const updateTree = (group: Group) => {
    setTree({ ...tree, group });
  };

  const handleChangeMode = (nextMode: 'simple' | 'advanced' | 'manual') => {
    if (nextMode !== 'manual') {
      // if swapping from manual, clear results
      setResult(null);
    }

    // prevent switching to simple mode if the tree is not compatible
    const simple = nextMode === 'simple';
    if (!simple) return setMode(nextMode);
    if (tree.group && treeIsCompatibleWithSimpleMode(tree.group)) return setMode(nextMode);

    const node = document.getElementById('modal')
    if (!node) return
  
    node.classList.remove('hidden')
    setMigrateModal(true);
  };

  if (!tree.group) return null
  return (
    <div className="flex flex-col w-full gap-4">

      {migrateModal && createPortal(
        <div className="bg-white dark:bg-monokai-light rounded-xl shadow p-8">
          <p className="font-bold text-xl mb-4">Compatibility Error</p>
          <p>Your current query is not compatible with the Simple Mode due to either:</p>
          <ul className="list-disc list-inside">
            <li>Nested rules</li>
            <li>"Not" rules</li>
            <li>"Or" rules</li>
          </ul>
          <p className="my-4">You can have your filter automatically converted, or stay in advanced mode.</p>
          <div className="space-x-2">
            <Button onClick={() => {
              setMode('simple');
              document.getElementById('modal')!.classList.add('hidden')
            }}>
              Convert
            </Button>
            <Button onClick={() => document.getElementById('modal')!.classList.add('hidden')}>Cancel</Button>
          </div>
        </div>,
        document.getElementById('modal')!
      )}

      {status.errors.invalidPath ? <InvalidPath /> : (
        <>
          <div className="flex items-center gap-4">
            {modes.map((m) => (
              <button 
                key={m} 
                className={`${mode === m ? 'box-selector-on' : 'box-selector-off'}`} 
                onClick={() => handleChangeMode(m)}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)} Mode
              </button>
            ))}
          </div>

          {mode === 'manual' && (
            <ManualInput onResult={setResult} />
          )}
          
          {mode === 'simple' && (
            <SimpleFilter tree={tree} updateTree={updateTree} />
          )}

          {mode === 'advanced' && (
            <AdvancedFilter tree={tree} updateTree={updateTree} />
          )}

          {mode === 'manual' || mode === 'advanced' && (
            <div className="flex flex-col gap-6 content-box">
              <div className="flex gap-2 items-center">
                <QuerySettings
                  limit={limit}
                  updateLimit={(limit) => setLimit(limit)}
                  order={order}
                  updateOrder={(order) => setOrder(order)}
                />
                {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                <Button className="input-height px-4" color="blue" onClick={exportData} disabled={loading}>
                  Search
                </Button>
                {loading && <CircularProgress size={25} />}
                {result && result.beatmaps === 0 && <>No results!</>}
              </div>
            </div>
          )}
        </>
      )}
      {result && result.beatmaps > 0 && (
        <div className="flex flex-col gap-4">
          <div className="content-box">
            <DownloadSettings mode={mode} result={result} />
          </div>
          <div className="content-box no-pad mt-0 flex flex-col gap-4">
            <span className="font-bold text-lg dark:text-white p-6 pb-2">Results</span>
            <ResultTable result={result} />
          </div>
        </div>
      )}
    </div>
  );
};
