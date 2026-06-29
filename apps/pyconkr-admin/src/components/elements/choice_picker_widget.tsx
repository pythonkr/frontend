import { EnumOptionsType, WidgetProps } from "@rjsf/utils";
import { FC, useMemo } from "react";

import { ChoicePicker, ChoicePickerOption } from "@apps/pyconkr-admin/components/elements/choice_picker";

export const ChoicePickerWidget: FC<WidgetProps> = (props) => {
  const { id, value, label, schema, required, disabled, readonly, options, onChange } = props;
  const choiceApp = options.choiceApp as string | undefined;
  const choiceResource = options.choiceResource as string | undefined;
  const source = useMemo(() => (choiceApp && choiceResource ? { app: choiceApp, resource: choiceResource } : undefined), [choiceApp, choiceResource]);

  const pickerOptions = useMemo<ChoicePickerOption[]>(() => {
    if (source) return [];
    const fromRjsf = options.enumOptions as EnumOptionsType[] | undefined;
    return fromRjsf?.map((o) => ({ value: o.value, label: o.label || String(o.value) })) ?? [];
  }, [source, options.enumOptions]);

  return (
    <ChoicePicker
      id={id}
      label={label || schema.title}
      source={source}
      options={pickerOptions}
      value={value ?? null}
      required={required}
      disabled={disabled || readonly}
      onChange={(v) => onChange(v ?? undefined)}
    />
  );
};
