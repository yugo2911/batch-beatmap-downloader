import classNames from "classnames";

interface NumericInputProps extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
}

export const NumericInput = ({ value, onChange, ...props }: NumericInputProps) => {
  if (isNaN(value)) {
    value = 0; // Default to 0 if the value is NaN
  }

  return (
    <input
      {...props}
      type="number"
      placeholder={props.placeholder}
      className={classNames(props.className)}
      value={value.toString()}
      onChange={(event) => onChange(event.target.valueAsNumber)}
    />
  );
};

