import * as Common from "@frontend/common";
import { Box, SelectProps, Stack, styled, Tab, Tabs, TextField, TextFieldProps, Typography, useMediaQuery } from "@mui/material";
import * as React from "react";

import { BlockQuote } from "./blockquote";
import { Fieldset } from "./fieldset";
import { PublicFileSelector } from "./public_file_selector";
import { useAppContext } from "../../contexts/app_context";

const ButtonWidth: React.CSSProperties["width"] = "4.5rem";

const FieldContainer = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "flex-start",

  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 0,
  },
}));

const SmallTabs = styled(Tabs)(({ theme }) => ({
  flexGrow: 1,
  width: ButtonWidth,
  minWidth: ButtonWidth,
  minHeight: "unset",

  "& .MuiTabs-list": {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  [theme.breakpoints.down("sm")]: {
    width: "100%",
    minWidth: "unset",

    "& .MuiTabs-list": {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
    },
  },
}));

const SmallTab = styled(Tab)(({ theme }) => ({
  width: ButtonWidth,
  minWidth: ButtonWidth,
  wordBreak: "keep-all",
  minHeight: "unset",
  padding: theme.spacing(0.5, 1),

  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 2),
  },
}));

type TranslatedText = {
  ko: string;
  en: string;
};

type MultiLanguageCommonProps = {
  label: TranslatedText;
  description?: TranslatedText;
};

type MultiLanguageFieldProps = Omit<TextFieldProps, "label" | "defaultValue" | "value" | "onChange"> &
  MultiLanguageCommonProps & {
    defaultValue?: TranslatedText;
    value?: TranslatedText;
    onChange?: (value: string | undefined, language: "ko" | "en") => void;
  };

type MultiLanguageFieldState = {
  selectedFieldLanguage: "ko" | "en";
};

export const MultiLanguageField: React.FC<MultiLanguageFieldProps> = ({ label, description, defaultValue, value, onChange, ...props }) => {
  const { language } = useAppContext();
  const [fieldState, setFieldState] = React.useState<MultiLanguageFieldState>({ selectedFieldLanguage: language });
  const setFieldLanguage = (_: React.SyntheticEvent, selectedFieldLanguage: "ko" | "en") => setFieldState((ps) => ({ ...ps, selectedFieldLanguage }));
  const koreanStr = language === "ko" ? "한국어" : "Korean";
  const englishStr = language === "ko" ? "영어" : "English";

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const tabOrientation = isMobile ? "horizontal" : "vertical";

  const inputDefaultValue = defaultValue && defaultValue[fieldState.selectedFieldLanguage];
  const inputValue = value && value[fieldState.selectedFieldLanguage];
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value, fieldState.selectedFieldLanguage);

  return (
    <Fieldset legend={label[language]}>
      <Stack spacing={2}>
        {description && <BlockQuote children={<Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }} children={description[language]} />} />}
        <FieldContainer>
          <SmallTabs orientation={tabOrientation} value={fieldState.selectedFieldLanguage} onChange={setFieldLanguage}>
            <SmallTab value="ko" sx={{ textTransform: "none" }} label={koreanStr} />
            <SmallTab value="en" sx={{ textTransform: "none" }} label={englishStr} />
          </SmallTabs>
          <TextField label={label[language]} defaultValue={inputDefaultValue} value={inputValue} onChange={handleChange} {...props} />
        </FieldContainer>
      </Stack>
    </Fieldset>
  );
};

type MultiLanguageMarkdownFieldProps = {
  disabled?: boolean;
  name?: string;
  defaultValue?: TranslatedText;
  value?: TranslatedText;
  onChange?: (value: string | undefined, language: "ko" | "en") => void;
} & MultiLanguageCommonProps;

const MDRendererContainer = styled(Box)(({ theme }) => ({
  width: "50%",
  maxWidth: "50%",
  backgroundColor: "#fff",

  "& .markdown-body": {
    width: "100%",
    p: { margin: theme.spacing(2, 0) },
  },
}));

export const MultiLanguageMarkdownField: React.FC<MultiLanguageMarkdownFieldProps> = ({
  label,
  description,
  defaultValue,
  value,
  onChange,
  ...props
}) => {
  const { language } = useAppContext();
  const [fieldState, setFieldState] = React.useState<MultiLanguageFieldState>({ selectedFieldLanguage: language });
  const setFieldLanguage = (_: React.SyntheticEvent, selectedFieldLanguage: "ko" | "en") => setFieldState((ps) => ({ ...ps, selectedFieldLanguage }));
  const koreanStr = language === "ko" ? "한국어" : "Korean";
  const englishStr = language === "ko" ? "영어" : "English";

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const tabOrientation = isMobile ? "horizontal" : "vertical";

  const inputDefaultValue = defaultValue && defaultValue[fieldState.selectedFieldLanguage];
  const inputValue = value && value[fieldState.selectedFieldLanguage];
  const handleChange = (value?: string) => onChange?.(value, fieldState.selectedFieldLanguage);

  return (
    <Fieldset legend={label[language]}>
      <Stack spacing={2}>
        {description && <BlockQuote children={<Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }} children={description[language]} />} />}
        <FieldContainer>
          <SmallTabs orientation={tabOrientation} value={fieldState.selectedFieldLanguage} onChange={setFieldLanguage}>
            <SmallTab value="ko" sx={{ textTransform: "none" }} label={koreanStr} />
            <SmallTab value="en" sx={{ textTransform: "none" }} label={englishStr} />
          </SmallTabs>
          <Stack direction="row" spacing={2} sx={{ width: "100%", height: "100%", minHeight: "100%", maxHeight: "100%", flexGrow: 1 }}>
            <Box sx={{ width: "50%", maxWidth: "50%" }}>
              <Common.Components.MarkdownEditor
                defaultValue={inputDefaultValue}
                value={inputValue}
                onChange={handleChange}
                extraCommands={[]}
                {...props}
              />
            </Box>
            <MDRendererContainer>
              <Common.Components.MDXRenderer text={inputValue || ""} format="md" />
            </MDRendererContainer>
          </Stack>
        </FieldContainer>
      </Stack>
    </Fieldset>
  );
};

type MultiLanguagePublicFileSelect = Omit<SelectProps<string | null | undefined>, "label"> & MultiLanguageCommonProps;

export const MultiLanguagePublicFileSelect: React.FC<MultiLanguagePublicFileSelect> = ({ label, description, ...props }) => {
  const { language } = useAppContext();
  const [fieldState, setFieldState] = React.useState<MultiLanguageFieldState>({ selectedFieldLanguage: language });
  const setFieldLanguage = (_: React.SyntheticEvent, selectedFieldLanguage: "ko" | "en") => setFieldState((ps) => ({ ...ps, selectedFieldLanguage }));
  const koreanStr = language === "ko" ? "한국어" : "Korean";
  const englishStr = language === "ko" ? "영어" : "English";

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const tabOrientation = isMobile ? "horizontal" : "vertical";

  return (
    <Fieldset legend={label[language]}>
      <Stack spacing={2}>
        {description && <BlockQuote children={<Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }} children={description[language]} />} />}
        <FieldContainer>
          <SmallTabs orientation={tabOrientation} value={fieldState.selectedFieldLanguage} onChange={setFieldLanguage}>
            <SmallTab value="ko" sx={{ textTransform: "none" }} label={koreanStr} />
            <SmallTab value="en" sx={{ textTransform: "none" }} label={englishStr} />
          </SmallTabs>
          <PublicFileSelector label={label[language]} {...props} />
        </FieldContainer>
      </Stack>
    </Fieldset>
  );
};
