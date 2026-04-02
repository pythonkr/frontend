import * as Common from "@frontend/common";
import { Add, Delete, OpenInNew } from "@mui/icons-material";
import { Box, Button, ButtonProps, CircularProgress, Divider, Stack, Tab, Tabs, ThemeProvider } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { commands } from "@uiw/react-md-editor";
import * as React from "react";
import { useParams } from "react-router-dom";

// I don't know why, I don't want to know why, I shouldn't have to wonder why,
// but for whatever reason this stupid namespace won't import on Common.Schemas.BackendAdminAPI.PageSectionSchema.
// TODO: FIXME: Remove this hack when the issue is resolved. This is dumb.
import { theme2025 } from "@frontend/theme";
import { createTheme } from "@mui/material/styles";

import BackendAdminAPISchemas from "../../../../../../packages/common/src/schemas/backendAdminAPI";

const muiTheme = createTheme(theme2025.muiTheme);
import { addErrorSnackbar } from "../../../utils/snackbar";
import { AdminEditor } from "../../layouts/admin_editor";

type SectionType = BackendAdminAPISchemas.PageSectionSchema;

type CommonSectionEditorPropType = {
  disabled?: boolean;
  onInsertNewSection: () => void;
  onDelete: () => void;
};

type SectionTextEditorPropType = CommonSectionEditorPropType & {
  defaultValue?: string;
  onChange: (value?: string) => void;
};

type SectionEditorPropType = CommonSectionEditorPropType & {
  language: "ko" | "en";
  defaultValue: SectionType;
  onChange: (value: SectionType) => void;
};

const SectionTextEditor: React.FC<SectionTextEditorPropType> = ({ disabled, defaultValue, onInsertNewSection, onChange, onDelete }) => {
  const deleteActionButton = commands.group([], {
    name: "delete",
    groupName: "delete",
    icon: <Delete style={{ fontSize: 12 }} />,
    execute: onDelete,
    buttonProps: { "aria-label": "Delete" },
  });

  return (
    <Stack direction="row" spacing={2} sx={{ width: "100%", height: "100%", maxWidth: "100%" }}>
      <Stack sx={{ flexGrow: 1, width: "50%" }}>
        <Common.Components.MDXEditor disabled={disabled} defaultValue={defaultValue} onChange={onChange} extraCommands={[deleteActionButton]} />
        <Button size="small" onClick={onInsertNewSection} startIcon={<Add />}>
          여기에 섹션 추가
        </Button>
      </Stack>
      <Box sx={{ flexGrow: 1, width: "50%", backgroundColor: "#fff" }}>
        <ThemeProvider theme={muiTheme}>
          <Common.Components.MDXRenderer text={defaultValue || ""} format="mdx" />
        </ThemeProvider>
      </Box>
    </Stack>
  );
};

const SectionEditorField: React.FC<SectionEditorPropType> = ({ language, disabled, defaultValue, onInsertNewSection, onChange, onDelete }) => {
  const onFieldChange = (key: "body_ko" | "body_en", value?: string) => onChange({ ...defaultValue, [key]: value });

  return (
    <Stack direction="row" sx={{ flexGrow: 1, width: "100%", height: "100%", maxWidth: "100%" }}>
      <SectionTextEditor
        disabled={disabled}
        onInsertNewSection={onInsertNewSection}
        onDelete={onDelete}
        defaultValue={defaultValue?.[`body_${language}`] || undefined}
        onChange={(text) => onFieldChange(`body_${language}`, text)}
      />
    </Stack>
  );
};

type AdminCMSPageEditorStateType = {
  tab: number;
  sections?: SectionType[];
};

export const AdminCMSPageEditor: React.FC = ErrorBoundary.with(
  { fallback: Common.Components.ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const { id } = useParams<{ id?: string }>();
    const { frontendDomain } = Common.Hooks.Common.useCommonContext();
    const backendAdminClient = Common.Hooks.BackendAdminAPI.useBackendAdminClient();
    const { data: initialSections } = Common.Hooks.BackendAdminAPI.useListPageSectionsQuery(backendAdminClient, id || "");
    const [editorState, setEditorState] = React.useState<AdminCMSPageEditorStateType>({
      sections: initialSections,
      tab: 0,
    });
    const bulkUpdateSectionsMutation = Common.Hooks.BackendAdminAPI.useBulkUpdatePageSectionsMutation(backendAdminClient, id || "");

    const setTab = (_: React.SyntheticEvent, selectedTab: number) => setEditorState((ps) => ({ ...ps, tab: selectedTab }));

    const openOnSiteButton: ButtonProps = {
      variant: "outlined",
      size: "small",
      onClick: () => id && window.open(`${frontendDomain || "https://pycon.kr"}/pages/${id}`, "_blank"),
      startIcon: <OpenInNew />,
      children: "홈페이지에서 페이지 보기",
    };

    const insertNewSection = (index: number) => () => {
      setEditorState((ps) => {
        const sections = [
          ...(ps.sections || []).slice(0, index),
          { order: 0, css: "", body_ko: "", body_en: "" },
          ...(ps.sections || []).slice(index),
        ].map((s, order) => ({ ...s, order })); // Reorder sections
        return { ...ps, sections };
      });
    };

    const deleteSection = (index: number) => () => {
      setEditorState((ps) => {
        const sections = [...(ps.sections || []).slice(0, index), ...(ps.sections || []).slice(index + 1)].map((s, order) => ({ ...s, order })); // Reorder sections
        return { ...ps, sections };
      });
    };

    const onSectionDataChange = (index: number) => (section: SectionType) => {
      setEditorState((ps) => {
        const newSectionList = [...(editorState.sections || [])];
        newSectionList[index] = section;
        return { ...ps, sections: newSectionList };
      });
    };

    const onSubmit = () => {
      if (id) {
        bulkUpdateSectionsMutation.mutate({ sections: editorState.sections || [] }, { onError: addErrorSnackbar });
      }
    };

    return (
      <AdminEditor app="cms" resource="page" id={id} extraActions={[openOnSiteButton]} afterSubmit={onSubmit}>
        {id ? (
          <>
            <br />
            <Divider />
            <br />
            <Stack direction="row" spacing={2} sx={{ width: "100%", height: "100%", maxWidth: "100%" }}>
              <Tabs orientation="vertical" value={editorState.tab} onChange={setTab} scrollButtons={false}>
                <Tab wrapped label="한국어" />
                <Tab wrapped label="영어" />
              </Tabs>
              <Stack sx={{ width: "100%", height: "100%", maxWidth: "100%" }}>
                <Button size="small" onClick={insertNewSection(0)} startIcon={<Add />}>
                  맨 처음에 섹션 추가
                </Button>
                {editorState.sections?.map((section, index) => (
                  <SectionEditorField
                    key={section.id || index}
                    defaultValue={section}
                    language={editorState.tab === 0 ? "ko" : "en"}
                    onInsertNewSection={insertNewSection(index + 1)}
                    onChange={onSectionDataChange(index)}
                    onDelete={deleteSection(index)}
                  />
                ))}
              </Stack>
            </Stack>
            <br />
            <Divider />
            <br />
          </>
        ) : (
          <Stack justifyContent="center" alignItems="center" sx={{ color: "red" }}>
            먼저 페이지를 만든 후 섹션 추가 / 수정이 가능합니다.
          </Stack>
        )}
      </AdminEditor>
    );
  })
);
