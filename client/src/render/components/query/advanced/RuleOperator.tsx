import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Rule, RuleType, operatorMap, Operator, DropdownOption } from "../../../../models/rules";
import { styles } from "@/components/util/Select";

interface PropTypes {
  rule: Rule;
  onChange: (rule: Rule) => void;
}

export const RuleOperator = ({ rule, onChange }: PropTypes) => {
  const [selectedOption, setSelectedOption] = useState<Operator | null>(null);

  useEffect(() => {
    const option = operatorMap[rule.type as RuleType]
      .find((i) => i.value === rule.operator);
    if (!option) {
      setSelectedOption(operatorMap[rule.type as RuleType][0]);
    } else {
      setSelectedOption(option);
    }
  }, [rule]);

  return (
    <Select
      className="w-52 my-react-select-container"
      classNamePrefix="my-react-select"
      styles={styles}
      options={operatorMap[rule.type as RuleType]}
      isSearchable={false}
      value={selectedOption}
      onChange={(e: DropdownOption) => onChange({ ...rule, operator: e?.value ?? "" })}
    />
  );
};
