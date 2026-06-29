import { CircularProgress, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { Suspense } from "@suspensive/react";
import { FC } from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { isEmpty, isNonNull, isNumber, isString } from "remeda";

import { useShopContext } from "@frontend/shop/hooks";
import type { Option, OptionGroupPlaceholderMode, OrderProductItem } from "@frontend/shop/schemas";
import { getCustomResponsePattern, getOrderProductOptionNotModifiableReason, isOrderProductOptionModifiable } from "@frontend/shop/utils";

import { PriceDisplay } from "./price_display";

type CommonOptionGroupType = {
  id: string;
  name: string;
};
type SelectableOptionGroupType = CommonOptionGroupType & {
  is_custom_response: false;
  custom_response_pattern: null;
  placeholder_mode: OptionGroupPlaceholderMode;
};
type CustomResponseOptionGroupType = CommonOptionGroupType & {
  is_custom_response: true;
  custom_response_pattern: string;
};
type OptionGroupType = SelectableOptionGroupType | CustomResponseOptionGroupType;

type SimplifiedOption = Pick<Option, "id" | "name" | "additional_price" | "leftover_stock">;

const isFilledString = (str: unknown): str is string => isString(str) && !isEmpty(str);

const SelectableOptionGroupInput: FC<{
  language: "ko" | "en";
  optionGroup: SelectableOptionGroupType;
  options: SimplifiedOption[];
  defaultValue?: string;
  disabled?: boolean;
  disabledReason?: string;
  control: Control<FieldValues, unknown, FieldValues>;
}> = ({ language, optionGroup, options, defaultValue, disabled, disabledReason, control }) => {
  const required = optionGroup.placeholder_mode !== "optional";
  const optionElements = options.map((option) => {
    const isOptionOutOfStock = isNumber(option.leftover_stock) && option.leftover_stock <= 0;

    return (
      <MenuItem key={option.id} value={option.id} disabled={disabled || isOptionOutOfStock}>
        {option.name}
        {option.additional_price > 0 && (
          <>
            {" "}
            [ +<PriceDisplay price={option.additional_price} /> ]
          </>
        )}
        {isOptionOutOfStock && <> ({language === "ko" ? "품절" : "Out of stock"})</>}
      </MenuItem>
    );
  });
  if (optionGroup.placeholder_mode !== "hidden") {
    optionElements.unshift(
      <MenuItem key="__placeholder" value="">
        <em>{language === "ko" ? "선택해주세요" : "Please select"}</em>
      </MenuItem>
    );
  }

  return (
    <FormControl fullWidth>
      <InputLabel id={`${optionGroup.id}label`}>{optionGroup.name}</InputLabel>
      <Controller
        control={control}
        name={optionGroup.id}
        rules={{ required }}
        disabled={disabled}
        defaultValue={defaultValue || ""}
        render={({ field }) => <Select label={`${optionGroup.id}label`} {...field} children={optionElements} />}
      />
      {isFilledString(disabledReason) && <FormHelperText>{disabledReason}</FormHelperText>}
    </FormControl>
  );
};

const CustomResponseOptionGroupInput: FC<{
  optionGroup: CustomResponseOptionGroupType;
  defaultValue?: string;
  disabled?: boolean;
  disabledReason?: string;
  control: Control<FieldValues, unknown, FieldValues>;
}> = ({ optionGroup, defaultValue, disabled, disabledReason, control }) => {
  return (
    <Controller
      control={control}
      name={optionGroup.id}
      rules={{ pattern: getCustomResponsePattern(optionGroup), required: true }}
      disabled={disabled}
      defaultValue={defaultValue || ""}
      render={({ field, formState: { errors } }) => {
        const errorMessage: string | undefined = errors?.[optionGroup.id]?.message?.toString();
        const helperText = errorMessage ?? (isFilledString(disabledReason) ? disabledReason : undefined);
        return <TextField label={optionGroup.name} {...field} error={!!errors[optionGroup.id]} helperText={helperText} />;
      }}
    />
  );
};

export const OptionGroupInput: FC<{
  language?: "ko" | "en";
  optionGroup: OptionGroupType;
  options: SimplifiedOption[];

  defaultValue?: string;
  disabled?: boolean;
  disabledReason?: string;

  control: Control<FieldValues, unknown, FieldValues>;
}> = ({ language, optionGroup, options, defaultValue, disabled, disabledReason, control }) =>
  optionGroup.is_custom_response ? (
    <CustomResponseOptionGroupInput
      optionGroup={optionGroup}
      defaultValue={defaultValue}
      disabled={disabled}
      disabledReason={disabledReason}
      control={control}
    />
  ) : (
    <SelectableOptionGroupInput
      language={language || "ko"}
      optionGroup={optionGroup}
      options={options}
      defaultValue={defaultValue}
      disabled={disabled}
      disabledReason={disabledReason}
      control={control}
    />
  );

export const OrderProductRelationOptionInput: FC<{
  optionRel: OrderProductItem["options"][number];
  disabled?: boolean;
  disabledReason?: string;
  control: Control<FieldValues, unknown, FieldValues>;
}> = Suspense.with({ fallback: <CircularProgress /> }, ({ optionRel, disabled, disabledReason, control }) => {
  const { language } = useShopContext();
  const guessedDisabledReason = getOrderProductOptionNotModifiableReason(language, optionRel) ?? undefined;
  let defaultValue: string | null = null;
  let dummyOptions: {
    id: string;
    name: string;
    additional_price: number;
    leftover_stock: number | null;
  }[] = [];

  // type hinting을 위해 if문을 사용함
  if (optionRel.product_option_group.is_custom_response === false && isNonNull(optionRel.product_option)) {
    defaultValue = optionRel.product_option.id;
    dummyOptions = [
      {
        id: optionRel.product_option.id,
        name: optionRel.product_option.name,
        additional_price: optionRel.product_option.additional_price || 0,
        leftover_stock: null,
      },
    ];
  } else {
    defaultValue = optionRel.custom_response;
  }

  return (
    <OptionGroupInput
      key={optionRel.product_option_group.id}
      optionGroup={optionRel.product_option_group}
      options={dummyOptions}
      defaultValue={defaultValue || undefined}
      disabled={disabled || !isOrderProductOptionModifiable(optionRel)}
      disabledReason={disabledReason || guessedDisabledReason}
      control={control}
    />
  );
});
