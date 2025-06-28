import React from "react";
import Select from "react-select";
import {
  inputOptions,
  Rule,
  defaultValuesMap,
  defaultOperatorsMap,
  RuleType,
  DropdownOption
} from "../../../../models/rules";
import { styles } from "@/components/util/Select";

interface PropTypes {
  rule: Rule;
  onChange: (rule: Rule) => void;
}

export const RuleSelector = ({ rule, onChange }: PropTypes) => {
  return (
    <Select
      className="w-52 my-react-select-container"
      classNamePrefix="my-react-select"
      styles={styles}
      options={inputOptions}
      defaultValue={inputOptions.find((i) => i.value === rule.field)}
      onChange={(option: DropdownOption) =>
        onChange({
          field: option?.value ?? "",
          type: option?.type ?? "",
          value: defaultValuesMap[option?.type ?? RuleType.TEXT],
          operator: defaultOperatorsMap[option?.type ?? RuleType.TEXT],
        })
      }
    />
  );
};
