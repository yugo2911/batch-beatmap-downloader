import Button from "@/components/util/Button";
import { Template } from "@/components/util/Template";
import classNames from "classnames";

type YesNoProps = {
  value: boolean;
  onChange?: (value: boolean) => void;
}

export function YesNo({ value, onChange }: YesNoProps) {
  return (
    <Template.InlineRow>
      {[true, false].map((v) => (
        <Button
          key={v.toString()}
          className={classNames('input-height w-12', {
            '!bg-monokai-light2': v !== value,
          })}
          onClick={() => onChange?.(v)}
        >
          {v ? 'Yes' : 'No'}
        </Button>
      ))}
    </Template.InlineRow>
  )
}
