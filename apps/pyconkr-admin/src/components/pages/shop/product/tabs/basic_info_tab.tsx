import { MarkdownEditor, MDXRenderer } from "@frontend/common/components";
import { useCommonContext } from "@frontend/common/hooks/useCommonContext";
import { Autocomplete, Box, Chip, Divider, MenuItem, Stack, styled, Tab, Tabs, TextField, Typography } from "@mui/material";
import { FC, useMemo, useState } from "react";

import { ChoicePicker, ChoicePickerOption } from "@apps/pyconkr-admin/components/elements/choice_picker";
import { ProductFormValues, SetField } from "@apps/pyconkr-admin/components/pages/shop/product/form";
import { CategoryGroupAdminWithCategories, TagAdmin } from "@apps/pyconkr-admin/components/pages/shop/product/types";
import { IMAGE_FILE_EXTENSIONS } from "@apps/pyconkr-admin/consts/file_extensions";

const MUIStyledFieldset = styled("fieldset")(({ theme }) => ({
  color: theme.palette.text.secondary,
  margin: 0,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

const MDXRendererContainer = styled(Box)(({ theme }) => ({
  width: "50%",
  maxWidth: "50%",
  "& .markdown-body": {
    width: "100%",
    p: { margin: theme.spacing(2, 0) },
    a: { color: theme.palette.primary.main },
  },
}));

type Props = {
  values: ProductFormValues;
  setField: SetField;
  disabled?: boolean;
  groups: CategoryGroupAdminWithCategories[];
  tags: TagAdmin[];
};

export const BasicInfoTab: FC<Props> = ({ values, setField, disabled, groups, tags }) => {
  const [langTab, setLangTab] = useState<"ko" | "en">("ko");
  const { baseUrl, mdxComponents } = useCommonContext();
  const selectedTags = tags.filter((t) => values.tag_set.includes(t.id));
  const isKo = langTab === "ko";
  const nameKey = isKo ? "name_ko" : "name_en";
  const descKey = isKo ? "description_ko" : "description_en";

  const imageOnly = useMemo(() => (o: ChoicePickerOption) => IMAGE_FILE_EXTENSIONS.some((ext) => o.label.toLowerCase().endsWith(`.${ext}`)), []);

  return (
    <Stack spacing={2}>
      <ChoicePicker
        label="대표 이미지"
        source={{ app: "file", resource: "publicfile" }}
        optionFilter={imageOnly}
        value={values.image || null}
        onChange={(v) => setField("image", v == null ? "" : String(v))}
      />

      <TextField select label="카테고리" required value={values.category} onChange={(e) => setField("category", e.target.value)} fullWidth>
        {groups.flatMap((group) => [
          <MenuItem key={`group-${group.id}`} disabled sx={{ fontWeight: 600, opacity: "0.8 !important" }}>
            {group.name}
          </MenuItem>,
          ...(group.categories ?? []).map((c) => (
            <MenuItem key={c.id} value={c.id} sx={{ pl: 4 }}>
              {c.name}
            </MenuItem>
          )),
        ])}
      </TextField>

      <Autocomplete
        multiple
        options={tags}
        getOptionLabel={(t) => t.name_ko || t.name_en || t.id}
        value={selectedTags}
        onChange={(_, newValue) =>
          setField(
            "tag_set",
            newValue.map((t) => t.id)
          )
        }
        renderValue={(value, getItemProps) =>
          value.map((option, index) => {
            const { key, ...rest } = getItemProps({ index });
            return <Chip key={key} {...rest} label={option.name_ko || option.name_en || option.id} />;
          })
        }
        renderInput={(params) => (
          <TextField {...params} label="태그" placeholder="태그를 선택하세요" helperText="태그는 별도 페이지에서 생성/수정할 수 있습니다." />
        )}
      />

      <Divider />

      <Stack direction="row" spacing={2}>
        <Tabs orientation="vertical" value={langTab} onChange={(_, v) => setLangTab(v)} scrollButtons={false}>
          <Tab value="ko" label="한국어" />
          <Tab value="en" label="영어" />
        </Tabs>
        <Stack direction="column" spacing={2} sx={{ width: "100%", maxWidth: "100%" }}>
          <TextField
            label={isKo ? "이름 (한국어)" : "이름 (영어)"}
            required
            value={values[nameKey]}
            onChange={(e) => setField(nameKey, e.target.value)}
            fullWidth
          />
          <MUIStyledFieldset>
            <Typography variant="subtitle2" component="legend">
              상품 설명 {isKo ? "(한국어)" : "(영어)"}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Box sx={{ width: "50%", maxWidth: "50%" }}>
                <MarkdownEditor disabled={disabled} name={descKey} value={values[descKey]} onChange={(value) => setField(descKey, value ?? "")} />
              </Box>
              <MDXRendererContainer>
                <MDXRenderer text={values[descKey]} format="mdx" baseUrl={baseUrl} mdxComponents={mdxComponents} />
              </MDXRendererContainer>
            </Stack>
          </MUIStyledFieldset>
        </Stack>
      </Stack>
    </Stack>
  );
};
