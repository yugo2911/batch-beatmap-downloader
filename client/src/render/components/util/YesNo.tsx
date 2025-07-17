import Button from "@/components/util/Button";
import { Template } from "@/components/util/Template";
import classNames from "classnames";

type YesNoProps = {
  value: boolean;
  yesLabel?: string;
  noLabel?: string;
  onChange?: (value: boolean) => void;
}

export function YesNo({ value, onChange, yesLabel = 'Yes', noLabel = 'No' }: YesNoProps) {
  return (
    <Template.InlineRow>
      {[true, false].map((v) => (
        <Button
          key={v.toString()}
          className={classNames('input-height min-w-12 px-2', {
            '!bg-monokai-light2': v !== value,
          })}
          onClick={() => onChange?.(v)}
        >
          {v ? yesLabel : noLabel}
        </Button>
      ))}
    </Template.InlineRow>
  )
}
