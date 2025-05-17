import * as React from "react";
import * as R from "remeda";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";

import ShopSchemas from "../../schemas";
import ShopAPIUtil from "../../utils";
import { PriceDisplay } from "./price_display";

type CommonOptionGroupType = {
  id: string;
  name: string;
};
type SelectableOptionGroupType = CommonOptionGroupType & {
  is_custom_response: false;
  custom_response_pattern: null;
};
type CustomResponseOptionGroupType = CommonOptionGroupType & {
  is_custom_response: true;
  custom_response_pattern: string;
};
type OptionGroupType =
  | SelectableOptionGroupType
  | CustomResponseOptionGroupType;

type SimplifiedOption = Pick<
  ShopSchemas.Option,
  "id" | "name" | "additional_price" | "leftover_stock"
>;

const isFilledString = (str: unknown): str is string =>
  R.isString(str) && !R.isEmpty(str);

const SelectableOptionGroupInput: React.FC<{
  optionGroup: SelectableOptionGroupType;
  options: SimplifiedOption[];
  defaultValue?: string;
  disabled?: boolean;
  disabledReason?: string;
}> = ({ optionGroup, options, defaultValue, disabled, disabledReason }) => {
  const optionElements = options.map((option) => {
    const isOptionOutOfStock =
      R.isNumber(option.leftover_stock) && option.leftover_stock <= 0;

    return (
      <MenuItem
        key={option.id}
        value={option.id}
        disabled={disabled || isOptionOutOfStock}
      >
        {option.name}
        {option.additional_price > 0 && (
          <>
            {" "}
            [ +<PriceDisplay price={option.additional_price} /> ]
          </>
        )}
        {isOptionOutOfStock && <> (품절)</>}
      </MenuItem>
    );
  });

  const selectElement = (
    <FormControl fullWidth>
      <InputLabel id={`${optionGroup.id}label`}>{optionGroup.name}</InputLabel>
      <Select
        label={`${optionGroup.id}label`}
        name={optionGroup.id}
        defaultValue={defaultValue}
        disabled={disabled}
        required
      >
        {optionElements}
      </Select>
    </FormControl>
  );

  return isFilledString(disabledReason) ? (
    <Tooltip title={disabledReason}>{selectElement}</Tooltip>
  ) : (
    selectElement
  );
};

const CustomResponseOptionGroupInput: React.FC<{
  optionGroup: CustomResponseOptionGroupType;
  defaultValue?: string;
  disabled?: boolean;
  disabledReason?: string;
}> = ({ optionGroup, defaultValue, disabled, disabledReason }) => {
  const pattern = ShopAPIUtil.getCustomResponsePattern(optionGroup)?.source;

  const textFieldElement = (
    <TextField
      label={optionGroup.name}
      name={optionGroup.id}
      required
      defaultValue={defaultValue}
      disabled={disabled}
      slotProps={{ htmlInput: { pattern } }}
    />
  );

  return isFilledString(disabledReason) ? (
    <Tooltip title={disabledReason}>{textFieldElement}</Tooltip>
  ) : (
    textFieldElement
  );
};

export const OptionGroupInput: React.FC<{
  optionGroup: OptionGroupType;
  options: SimplifiedOption[];

  defaultValue?: string;
  disabled?: boolean;
  disabledReason?: string;
}> = ({ optionGroup, options, defaultValue, disabled, disabledReason }) =>
  optionGroup.is_custom_response ? (
    <CustomResponseOptionGroupInput
      optionGroup={optionGroup}
      defaultValue={defaultValue}
      disabled={disabled}
      disabledReason={disabledReason}
    />
  ) : (
    <SelectableOptionGroupInput
      optionGroup={optionGroup}
      options={options}
      defaultValue={defaultValue}
      disabled={disabled}
      disabledReason={disabledReason}
    />
  );

export const OrderProductRelationOptionInput: React.FC<{
  optionRel: ShopSchemas.OrderProductItem["options"][number];
  disabled?: boolean;
  disabledReason?: string;
}> = ({ optionRel, disabled, disabledReason }) => {
  let defaultValue: string | null = null;
  let guessedDisabledReason: string | undefined = undefined;
  let dummyOptions: {
    id: string;
    name: string;
    additional_price: number;
    leftover_stock: number | null;
  }[] = [];

  // type hinting을 위해 if문을 사용함
  if (
    optionRel.product_option_group.is_custom_response === false &&
    R.isNonNull(optionRel.product_option)
  ) {
    defaultValue = optionRel.product_option.id;
    guessedDisabledReason = "추가 비용이 발생하는 옵션은 수정할 수 없어요.";
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
      disabled={
        disabled || !ShopAPIUtil.isOrderProductOptionModifiable(optionRel)
      }
      disabledReason={disabledReason || guessedDisabledReason}
    />
  );
};
