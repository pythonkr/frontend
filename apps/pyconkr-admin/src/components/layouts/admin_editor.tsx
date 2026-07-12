import { retrieve } from "@frontend/common/apis/admin_api";
import { LottieDebugPanel, MarkdownEditor, MDXRenderer } from "@frontend/common/components";
import { useBackendAdminClient, useCreateMutation, useRemoveMutation, useSchemaQuery, useUpdateMutation } from "@frontend/common/hooks/useAdminAPI";
import { useCommonContext } from "@frontend/common/hooks/useCommonContext";
import {
  filterPropertiesByLanguageInJsonSchema,
  filterReadOnlyPropertiesInJsonSchema,
  filterWritablePropertiesInJsonSchema,
} from "@frontend/common/utils";
import { Add, Close, Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonProps,
  CircularProgress,
  IconButton,
  Stack,
  styled,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import Form, { IChangeEvent } from "@rjsf/core";
import MuiForm from "@rjsf/mui";
import { Field, RJSFSchema, UiSchema } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import AjvDraft04 from "ajv-draft-04";
import {
  ChangeEvent,
  FC,
  FormEvent,
  MouseEventHandler,
  PropsWithChildren,
  ReactNode,
  SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { isArray, isNonNullish, isObjectType, isString } from "remeda";

import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ChoicePicker } from "@apps/pyconkr-admin/components/elements/choice_picker";
import { ChoicePickerWidget } from "@apps/pyconkr-admin/components/elements/choice_picker_widget";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

type EditorFormDataEventType = IChangeEvent<Record<string, string>, RJSFSchema, { [k in string]: unknown }>;
type onSubmitType = (data: Record<string, string>, event: FormEvent<unknown>) => void;

type AppResourceType = { app: string; resource: string };
type AppResourceIdType = AppResourceType & { id?: string };
export type FieldLinkTarget = {
  app: string;
  resource: string;
};
type AdminEditorPropsType = PropsWithChildren<{
  hidingFields?: string[];
  context?: Record<string, unknown>;
  onCreated?: (data: Record<string, string>) => void;
  onClose?: () => void;
  beforeSubmit?: onSubmitType;
  afterSubmit?: onSubmitType;
  notModifiable?: boolean;
  notDeletable?: boolean;
  extraReadOnlyData?: Record<string, ReactNode>;
  extraActions?: ButtonProps[];
  /**
   * For each field, render an "open in new tab" link next to the value pointing at the editor route
   * for that field's referenced object. Currently applies to the read-only field table only.
   * The field's current value is used as the target id.
   */
  fieldLinks?: Record<string, FieldLinkTarget>;
}>;

const processFile = (event: ChangeEvent<HTMLInputElement>) => {
  if (!event.target.files || event.target.files.length === 0) return Promise.resolve("");

  const f = event.target.files[0];
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target ? event.target.result : "");
    reader.readAsDataURL(f);
  });
};

const FileField: Field = (p) => (
  <input
    type="file"
    required={p.required}
    disabled={p.disabled}
    defaultValue={p.defaultValue}
    onChange={(event) => processFile(event).then(p.onChange)}
  />
);

const M2MSelect: Field = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, (props) => {
    const uiOptions = props.uiSchema?.["ui:options"] as { choiceApp?: string; choiceResource?: string } | undefined;
    // M2M 은 백엔드가 항상 choiceApp/choiceResource 제공 → selectables 로 조회
    const source = uiOptions?.choiceApp && uiOptions?.choiceResource ? { app: uiOptions.choiceApp, resource: uiOptions.choiceResource } : undefined;
    const value = (isArray(props.formData) ? props.formData : []).map((v) => String(v));
    return (
      <ChoicePicker
        multiple
        id={props.idSchema?.$id}
        label={props.name}
        source={source}
        value={value}
        required={props.required}
        disabled={props.disabled || props.readonly}
        onChange={(newValue) => props.onChange(newValue, undefined, props.name)}
      />
    );
  })
);

const MUIStyledFieldset = styled("fieldset")(({ theme }) => ({
  color: theme.palette.text.secondary,
  margin: 0,

  border: `1px solid ${theme.palette.info}`,
  borderRadius: theme.shape.borderRadius,
}));

const MDRendererContainer = styled(Box)(({ theme }) => ({
  width: "50%",
  maxWidth: "50%",
  backgroundColor: "#fff",

  "& .markdown-body": {
    width: "100%",
    p: { margin: theme.spacing(2, 0) },
    a: { color: theme.palette.primary.main },
  },
}));

const MDEditorField: Field = ErrorBoundary.with({ fallback: ErrorFallback }, ({ disabled, formData, name, onChange: rawOnChange }) => {
  const { baseUrl, mdxComponents } = useCommonContext();
  const [valueState, setValueState] = useState<string | undefined>(formData?.toString() || "");
  const onChange = (value?: string) => {
    setValueState(value);
    rawOnChange(value, undefined, name);
  };
  return (
    <MUIStyledFieldset>
      <Typography variant="subtitle2" component="legend" children={name} />
      <Stack direction="row" spacing={2} sx={{ width: "100%", height: "100%", minHeight: "100%", maxHeight: "100%", flexGrow: 1, py: 2 }}>
        <Box sx={{ width: "50%", maxWidth: "50%" }}>
          <MarkdownEditor disabled={disabled} name={name} value={valueState} onChange={onChange} extraCommands={[]} />
        </Box>
        <MDRendererContainer>
          <MDXRenderer text={valueState || ""} format="md" baseUrl={baseUrl} mdxComponents={mdxComponents} />
        </MDRendererContainer>
      </Stack>
    </MUIStyledFieldset>
  );
});

type ReadOnlyValueFieldStateType = {
  loading: boolean;
  blob: Blob | null;
  blobText: string | null;
  objectUrl: string | null;
};

const ReadOnlyValueField: FC<{
  name: string;
  value: unknown;
  uiSchema: UiSchema;
}> = Suspense.with({ fallback: <CircularProgress /> }, ({ name, value, uiSchema }) => {
  const [fieldState, setFieldState] = useState<ReadOnlyValueFieldStateType>({
    loading: true,
    blob: null,
    blobText: null,
    objectUrl: null,
  });

  useEffect(() => {
    (async () => {
      if (!(isString(value) && value.startsWith("http") && uiSchema?.[name]["ui:field"] === "file")) {
        setFieldState((ps) => ({ ...ps, loading: false }));
        return;
      }

      const blob = await (await fetch(value)).blob();
      const blobText = await blob.text();
      const objectUrl = URL.createObjectURL(blob);
      setFieldState((ps) => ({ ...ps, loading: false, blob, blobText, objectUrl }));
    })();
  }, [value, name, uiSchema]);

  if (fieldState.loading) return <CircularProgress />;

  if (uiSchema?.[name]?.["ui:field"] === "file" && fieldState.blob) {
    return (
      <Stack spacing={2} alignItems="flex-start">
        {fieldState.blob.type.startsWith("image/") && fieldState.objectUrl && (
          <img src={fieldState.objectUrl} alt={name} style={{ maxWidth: "600px", objectFit: "contain" }} />
        )}
        {fieldState.blob.type.startsWith("application/json") && fieldState.blobText && (
          <Box sx={{ maxWidth: "600px", overflow: "auto" }}>
            <LottieDebugPanel data={JSON.parse(fieldState.blobText)} />
          </Box>
        )}
        <a href={value as string}>링크</a>
      </Stack>
    );
  }

  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    return (
      <Box
        component="pre"
        sx={{ m: 0, p: 1, fontSize: "0.85em", whiteSpace: "pre-wrap", wordBreak: "break-all", backgroundColor: "action.hover", borderRadius: 1 }}
      >
        {JSON.stringify(value, null, 2)}
      </Box>
    );
  }
  return String(value);
});

type InnerAdminEditorStateType = {
  tab: number;
  formData: Record<string, string> | undefined;
};

const InnerAdminEditor: FC<AppResourceIdType & AdminEditorPropsType> = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with(
    { fallback: <CircularProgress /> },
    ({
      app,
      resource,
      id,
      hidingFields,
      context,
      onCreated,
      onClose,
      beforeSubmit,
      afterSubmit,
      extraActions,
      extraReadOnlyData,
      notModifiable,
      notDeletable,
      fieldLinks,
      children,
    }) => {
      const navigate = useNavigate();
      const formRef = useRef<Form<Record<string, string>, RJSFSchema, { [k in string]: unknown }> | null>(null);
      const [editorState, setEditorState] = useState<InnerAdminEditorStateType>({
        tab: 0,
        formData: undefined,
      });

      const backendAdminClient = useBackendAdminClient();
      const { data: schemaInfo } = useSchemaQuery(backendAdminClient, app, resource);

      const setTab = (_: SyntheticEvent, tab: number) => setEditorState((ps) => ({ ...ps, tab }));
      const setFormData = (formData?: Record<string, string>) => setEditorState((ps) => ({ ...ps, formData }));
      const appendFormDataState = (data?: Record<string, string>) => setEditorState((ps) => ({ ...ps, formData: { ...ps.formData, ...data } }));
      const selectedLanguage = editorState.tab === 0 ? "ko" : "en";
      const notSelectedLanguage = editorState.tab === 0 ? "en" : "ko";

      const createMutation = useCreateMutation<Record<string, string>>(backendAdminClient, app, resource);
      const modifyMutation = useUpdateMutation<Record<string, string>>(backendAdminClient, app, resource, id || "");
      const deleteMutation = useRemoveMutation(backendAdminClient, app, resource, id || "undefined");
      const submitMutation = id ? modifyMutation : createMutation;

      useEffect(() => {
        (async () => {
          if (!id) {
            setFormData((context ?? {}) as Record<string, string>);
            return;
          }

          const initialData = await retrieve<Record<string, string>>(backendAdminClient, app, resource, id)();
          setFormData({ ...initialData, ...context } as Record<string, string>);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [app, resource, id, context]);

      const onSubmitButtonClick: MouseEventHandler<HTMLButtonElement> = () => formRef.current && formRef.current.submit();

      const onSubmitFunc = (data: EditorFormDataEventType, event: FormEvent) => {
        // react-jsonschema-form에서 주는 formData에는 translation_fields로 필터링된 필드가 빠져있어,
        // 사용자가 특정 탭에서 수정한 후 다른 탭으로 이동해서 수정하게 되면 이전 탭의 수정 내용이 사라지는 문제가 발생함.
        // 따라서, onChange로 항상 값이 추적되는 editorState.formData를 가장 우선적으로 사용함.
        const newFormData = editorState.formData || data.formData || {};
        beforeSubmit?.(newFormData, event);
        submitMutation.mutate(newFormData, {
          onSuccess: (newFormData) => {
            if (!id && onCreated) {
              onCreated(newFormData);
            } else {
              addSnackbar(id ? "저장했습니다." : "페이지를 생성했습니다.", "success");
              afterSubmit?.(newFormData, event);
              if (!id && newFormData.id) navigate(`/${app}/${resource}/${newFormData.id}`);
            }
          },
          onError: addErrorSnackbar,
        });
      };

      const onDeleteFunc = () => {
        if (window.confirm("정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
          deleteMutation.mutate(undefined, {
            onSuccess: () => {
              addSnackbar("삭제했습니다.", "success");
              navigate(`/${app}/${resource}`);
            },
            onError: addErrorSnackbar,
          });
        }
      };

      const goToCreateNew = () => navigate(`/${app}/${resource}/create`);

      if (isNonNullish(hidingFields) && isObjectType(schemaInfo.schema.properties)) {
        schemaInfo.schema.properties = Object.entries(schemaInfo.schema.properties || {})
          .filter(([key]) => !hidingFields.includes(key))
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as RJSFSchema);
      }

      const writableSchema = filterPropertiesByLanguageInJsonSchema(
        filterWritablePropertiesInJsonSchema(schemaInfo.schema),
        schemaInfo.translation_fields,
        selectedLanguage
      );
      const readOnlySchema = filterPropertiesByLanguageInJsonSchema(
        filterReadOnlyPropertiesInJsonSchema(schemaInfo.schema),
        schemaInfo.translation_fields,
        selectedLanguage
      );
      const baseUiSchema: UiSchema = schemaInfo.ui_schema;
      const uiSchema: UiSchema = useMemo(() => {
        const props = schemaInfo.schema.properties as Record<string, RJSFSchema> | undefined;
        const enriched: UiSchema = { ...baseUiSchema };
        for (const [fieldName, fieldUi] of Object.entries(baseUiSchema)) {
          const opts = (fieldUi as UiSchema | undefined)?.["ui:options"] as { choiceResource?: string } | undefined;
          const prop = props?.[fieldName];
          if (!opts?.choiceResource || !prop || prop.type === "array") continue;
          enriched[fieldName] = { ...(enriched[fieldName] ?? {}), "ui:widget": "choice_picker" };
        }
        return enriched;
      }, [schemaInfo.schema, baseUiSchema]);
      const disabled = createMutation.isPending || modifyMutation.isPending || deleteMutation.isPending;
      const title = `${app.toUpperCase()} > ${resource.toUpperCase()} > ${id ? "편집: " + id : "새 객체 추가"}`;

      const notSelectedLangFields = schemaInfo.translation_fields.map((f) => `${f}_${notSelectedLanguage}`);
      const languageFilteredFormData = editorState.formData
        ? Object.entries(editorState.formData)
            .filter(([k]) => !notSelectedLangFields.includes(k))
            .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Record<string, string>)
        : undefined;

      const handleCtrlSAction: (this: GlobalEventHandlers, ev: KeyboardEvent) => void = (event) => {
        if (event.key === "s" && (event.ctrlKey || event.metaKey)) {
          console.log("Ctrl+S pressed, executing save action");
          event.preventDefault();
          event.stopPropagation();
          formRef.current?.submit();
        }
      };

      useEffect(() => {
        document.addEventListener("keydown", handleCtrlSAction);
        return () => {
          console.log("Removing event listener for Ctrl+S action");
          document.removeEventListener("keydown", handleCtrlSAction);
        };
      }, []);

      if (editorState.formData === undefined) return <CircularProgress />;

      return (
        <Box sx={{ flexGrow: 1, width: "100%", minHeight: "100%" }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h5">{title}</Typography>
            {onClose && <Box children={<IconButton children={<Close />} />} onClick={onClose} />}
          </Stack>
          <Stack direction="row" spacing={2} sx={{ width: "100%", height: "100%", maxWidth: "100%" }}>
            <Tabs orientation="vertical" value={editorState.tab} onChange={setTab} scrollButtons={false}>
              <Tab wrapped label="한국어" />
              <Tab wrapped label="영어" />
            </Tabs>
            <Box sx={{ flexGrow: 1 }}>
              {id && (
                <>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>필드</TableCell>
                        <TableCell>값</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.keys(readOnlySchema.properties || {}).map((key) => {
                        const link = fieldLinks?.[key];
                        const value = languageFilteredFormData?.[key];
                        const showLink = link && value !== null && value !== undefined && value !== "";
                        const field = <ReadOnlyValueField name={key} value={value} uiSchema={uiSchema} />;
                        return (
                          <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>{showLink ? <Link to={`/${link.app}/${link.resource}/${value}`}>{field}</Link> : field}</TableCell>
                          </TableRow>
                        );
                      })}
                      {Object.entries(extraReadOnlyData ?? {}).map(([key, value]) => (
                        <TableRow key={`additional-${key}`}>
                          <TableCell>{key}</TableCell>
                          <TableCell>{value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <br />
                </>
              )}
              <MuiForm
                ref={formRef}
                schema={writableSchema}
                uiSchema={{
                  ...uiSchema,
                  "ui:submitButtonOptions": { norender: true },
                }}
                validator={customizeValidator({ AjvClass: AjvDraft04 })}
                formData={languageFilteredFormData}
                liveValidate
                focusOnFirstError
                formContext={{ readonlyAsDisabled: true }}
                onChange={({ formData }) => appendFormDataState(formData)}
                onSubmit={onSubmitFunc}
                disabled={disabled}
                showErrorList={false}
                fields={{ file: FileField, m2m_select: M2MSelect, markdown: MDEditorField }}
                widgets={{ SelectWidget: ChoicePickerWidget, choice_picker: ChoicePickerWidget }}
              />
            </Box>
          </Stack>
          {children}
          <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
            {id ? (
              <>
                {(extraActions || []).map((p, i) => (
                  <Button key={i} {...p} />
                ))}
                <Button variant="outlined" color="info" onClick={goToCreateNew} disabled={disabled} startIcon={<Add />}>
                  새 객체 추가
                </Button>
                {!notDeletable && (
                  <Button variant="outlined" color="error" onClick={onDeleteFunc} disabled={disabled} startIcon={<Delete />}>
                    삭제
                  </Button>
                )}
                {!notModifiable && (
                  <Button variant="contained" color="primary" onClick={onSubmitButtonClick} disabled={disabled} startIcon={<Edit />}>
                    수정
                  </Button>
                )}
              </>
            ) : (
              <Button type="submit" variant="contained" color="primary" onClick={onSubmitButtonClick} disabled={disabled} startIcon={<Add />}>
                새 객체 추가
              </Button>
            )}
          </Stack>
        </Box>
      );
    }
  )
);

export const AdminEditor: FC<AppResourceIdType & AdminEditorPropsType> = (props) => (
  <BackendAdminSignInGuard>
    <InnerAdminEditor {...props} />
  </BackendAdminSignInGuard>
);

export const AdminEditorCreateRoutePage: FC<AppResourceType & AdminEditorPropsType> = (props) => <AdminEditor {...props} />;

export const AdminEditorModifyRoutePage: FC<AppResourceType & AdminEditorPropsType> = Suspense.with({ fallback: <CircularProgress /> }, (props) => {
  const { id } = useParams<{ id?: string }>();
  return <AdminEditor {...props} id={id} />;
});
