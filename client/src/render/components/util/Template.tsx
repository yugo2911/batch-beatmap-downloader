import { BaseComponent, BaseComponentProps } from "@/components/util/BaseComponent";

function Column(props: BaseComponentProps) {
  return (
    <BaseComponent {...props} as="div" baseClassName="flex flex-col gap-2" />
  )
}

function InlineRow(props: BaseComponentProps) {
  return (
    <BaseComponent {...props} as="div" baseClassName="flex flex-row gap-2" />
  )
}

export const Template = {
  Column,
  InlineRow
};

