import React, { JSX } from "react";
import classNames from "classnames";

type DivProps = React.ComponentPropsWithoutRef<"div">;

type InternalBaseComponentProps = DivProps & {
  baseClassName?: string;
  as: "div" | "span";
};

export type BaseComponentProps = Omit<InternalBaseComponentProps, "as">;

export function BaseComponent({
  baseClassName,
  ...props
}: InternalBaseComponentProps) {
  const Component = props.as;
  const className = classNames(baseClassName, props.className);

  return <Component {...props} className={className} />;
}
