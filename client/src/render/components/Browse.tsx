import Button from "../components/util/Button";
import React from "react";
import { toast } from "react-toastify";
import { Template } from "@/components/util/Template";
import classNames from "classnames";

interface PropTypes {
  path: string;
  update: (path: string) => void;
  invalid?: boolean;
}

export const Browse = ({ path, update, invalid }: PropTypes) => {
  const browse = async () => {
    const res = await window.electron.browse();
    if (!res.canceled) {
      const path = res.filePaths[0]
      toast.success(`Path updated!`)
      update(path);
    }
  };

  return (
    <Template.InlineRow className="w-full">
      <input
        className={classNames('w-full', {
          '!border-red-500': invalid,
        })}
        value={path}
        disabled={true}
      />
      <Button color="blue" onClick={() => browse()}>Browse</Button>
    </Template.InlineRow>
  )
}
