import { Add, Delete, OpenInNew } from "@mui/icons-material";
import { Box, Button, ButtonProps, CircularProgress, Divider, Stack, Tab, Tabs, ThemeProvider } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { commands } from "@uiw/react-md-editor";
import { FC, SyntheticEvent, useState } from "react";
import { useParams } from "react-router-dom";

import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { AdminEditor } from "@apps/pyconkr-admin/components/layouts/admin_editor";
import { muiTheme } from "@apps/pyconkr-admin/styles/globalStyles";
import { addErrorSnackbar } from "@apps/pyconkr-admin/utils/snackbar";
import { MDXEditor, MDXRenderer } from "@frontend/common/components";
import { useBackendAdminClient, useBulkUpdatePageSectionsMutation, useListPageSectionsQuery } from "@frontend/common/hooks/useAdminAPI";
import { useCommonContext } from "@frontend/common/hooks/useCommonContext";
import { PageSectionSchema } from "@frontend/common/schemas/backendAdminAPI";

type SectionType = PageSectionSchema;

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

const SectionTextEditor: FC<SectionTextEditorPropType> = ({ disabled, defaultValue, onInsertNewSection, onChange, onDelete }) => {
  const { baseUrl, mdxComponents } = useCommonContext();
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
        <MDXEditor disabled={disabled} defaultValue={defaultValue} onChange={onChange} extraCommands={[deleteActionButton]} />
        <Button size="small" onClick={onInsertNewSection} startIcon={<Add />}>
          여기에 섹션 추가
        </Button>
      </Stack>
      <Box sx={{ flexGrow: 1, width: "50%", backgroundColor: "#fff" }}>
        <ThemeProvider theme={muiTheme}>
          <MDXRenderer text={defaultValue || ""} format="mdx" baseUrl={baseUrl} mdxComponents={mdxComponents} />
        </ThemeProvider>
      </Box>
    </Stack>
  );
};

const SectionEditorField: FC<SectionEditorPropType> = ({ language, disabled, defaultValue, onInsertNewSection, onChange, onDelete }) => {
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

export const AdminCMSPageEditor: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const { id } = useParams<{ id?: string }>();
    const { frontendDomain } = useCommonContext();
    const backendAdminClient = useBackendAdminClient();
    const { data: initialSections } = useListPageSectionsQuery(backendAdminClient, id || "");
    const [editorState, setEditorState] = useState<AdminCMSPageEditorStateType>({
      sections: initialSections,
      tab: 0,
    });
    const bulkUpdateSectionsMutation = useBulkUpdatePageSectionsMutation(backendAdminClient, id || "");

    const setTab = (_: SyntheticEvent, selectedTab: number) => setEditorState((ps) => ({ ...ps, tab: selectedTab }));

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
