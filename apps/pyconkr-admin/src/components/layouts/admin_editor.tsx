import * as Common from "@frontend/common";
import { Add, Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonProps,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Form, { IChangeEvent } from "@rjsf/core";
import MuiForm from "@rjsf/mui";
import { Field, RJSFSchema, UiSchema } from "@rjsf/utils";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import AjvDraft04 from "ajv-draft-04";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { addErrorSnackbar, addSnackbar } from "../../utils/snackbar";
import { BackendAdminSignInGuard } from "../elements/admin_signin_guard";

type EditorFormDataEventType = IChangeEvent<
  Record<string, string>,
  RJSFSchema,
  { [k in string]: unknown }
>;
type onSubmitType = (
  data: EditorFormDataEventType,
  event: React.FormEvent<unknown>
) => void;

type AppResourceType = { app: string; resource: string };
type AppResourceIdType = AppResourceType & { id?: string };
type AdminEditorPropsType = React.PropsWithChildren<{
  beforeSubmit?: onSubmitType;
  afterSubmit?: onSubmitType;
  notModifiable?: boolean;
  notDeletable?: boolean;
  extraActions?: ButtonProps[];
}>;

const processFile = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (!event.target.files || event.target.files.length === 0)
    return Promise.resolve("");

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

const ReadOnlyValueField: React.FC<{
  name: string;
  value: unknown;
  uiSchema: UiSchema;
}> = ({ name, value, uiSchema }) => {
  if (uiSchema[name] && uiSchema[name]["ui:field"] === "file") {
    return (
      <Stack spacing={2} alignItems="flex-start">
        <img
          src={value as string}
          alt={name}
          style={{ maxWidth: "100%", maxHeight: "600px", objectFit: "contain" }}
        />
        <a href={value as string}>링크</a>
      </Stack>
    );
  }

  return value as string;
};

const InnerAdminEditor: React.FC<AppResourceIdType & AdminEditorPropsType> =
  ErrorBoundary.with(
    { fallback: Common.Components.ErrorFallback },
    Suspense.with(
      { fallback: <CircularProgress /> },
      ({
        app,
        resource,
        id,
        beforeSubmit,
        afterSubmit,
        extraActions,
        notModifiable,
        notDeletable,
        children,
      }) => {
        const navigate = useNavigate();
        const formRef = React.useRef<Form<
          Record<string, string>,
          RJSFSchema,
          { [k in string]: unknown }
        > | null>(null);
        const [formDataState, setFormDataState] = React.useState<
          Record<string, string> | undefined
        >(undefined);
        const backendAdminClient =
          Common.Hooks.BackendAdminAPI.useBackendAdminClient();
        const { data: schemaInfo } =
          Common.Hooks.BackendAdminAPI.useSchemaQuery(
            backendAdminClient,
            app,
            resource
          );

        const createMutation = Common.Hooks.BackendAdminAPI.useCreateMutation<
          Record<string, string>
        >(backendAdminClient, app, resource);
        const modifyMutation = Common.Hooks.BackendAdminAPI.useUpdateMutation<
          Record<string, string>
        >(backendAdminClient, app, resource, id || "");
        const deleteMutation = Common.Hooks.BackendAdminAPI.useRemoveMutation(
          backendAdminClient,
          app,
          resource,
          id || "undefined"
        );
        const submitMutation = id ? modifyMutation : createMutation;

        React.useEffect(() => {
          (async () => {
            if (!id) {
              setFormDataState({});
              return;
            }

            setFormDataState(
              (await Common.BackendAdminAPIs.retrieve<Record<string, string>>(
                backendAdminClient,
                app,
                resource,
                id
              )()) || {}
            );
          })();
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [app, resource, id]);

        const onSubmitButtonClick: React.MouseEventHandler<
          HTMLButtonElement
        > = () => formRef.current && formRef.current.submit();

        const onSubmitFunc: onSubmitType = (data, event) => {
          beforeSubmit?.(data, event);
          submitMutation.mutate(data.formData || {}, {
            onSuccess: () => {
              addSnackbar(
                id ? "저장했습니다." : "페이지를 생성했습니다.",
                "success"
              );
              afterSubmit?.(data, event);

              if (!id && data.formData?.id)
                navigate(`/${app}/${resource}/${data.formData?.id}`);
            },
            onError: addErrorSnackbar,
          });
        };

        const onDeleteFunc = () => {
          if (
            window.confirm(
              "정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
            )
          ) {
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

        const writableSchema =
          Common.Utils.filterWritablePropertiesInJsonSchema(schemaInfo.schema);
        const readOnlySchema =
          Common.Utils.filterReadOnlyPropertiesInJsonSchema(schemaInfo.schema);
        const uiSchema: UiSchema = schemaInfo.ui_schema;
        const disabled =
          createMutation.isPending ||
          modifyMutation.isPending ||
          deleteMutation.isPending;
        const title = `${app.toUpperCase()} > ${resource.toUpperCase()} > ${id ? "편집: " + id : "새 객체 추가"}`;

        const handleCtrlSAction: (
          this: GlobalEventHandlers,
          ev: KeyboardEvent
        ) => void = (event) => {
          if (event.key === "s" && (event.ctrlKey || event.metaKey)) {
            console.log("Ctrl+S pressed, executing save action");
            event.preventDefault();
            event.stopPropagation();
            formRef.current?.submit();
          }
        };

        React.useEffect(() => {
          document.addEventListener("keydown", handleCtrlSAction);
          return () => {
            console.log("Removing event listener for Ctrl+S action");
            document.removeEventListener("keydown", handleCtrlSAction);
          };
        }, []);

        if (formDataState === undefined) return <CircularProgress />;

        return (
          <Box sx={{ flexGrow: 1, width: "100%", minHeight: "100%" }}>
            <Typography variant="h5">{title}</Typography>
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
                    {Object.keys(readOnlySchema.properties || {}).map((key) => (
                      <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell>
                          <ReadOnlyValueField
                            name={key}
                            value={formDataState?.[key]}
                            uiSchema={uiSchema}
                          />
                        </TableCell>
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
              formData={formDataState}
              liveValidate
              focusOnFirstError
              formContext={{ readonlyAsDisabled: true }}
              onChange={({ formData }) => setFormDataState(formData)}
              onSubmit={onSubmitFunc}
              disabled={disabled}
              showErrorList={false}
              fields={{ file: FileField }}
            />
            {children}
            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: "flex-end" }}
            >
              {id ? (
                <>
                  {(extraActions || []).map((p, i) => (
                    <Button key={i} {...p} />
                  ))}
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={goToCreateNew}
                    disabled={disabled}
                    startIcon={<Add />}
                  >
                    새 객체 추가
                  </Button>
                  {!notDeletable && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={onDeleteFunc}
                      disabled={disabled}
                      startIcon={<Delete />}
                    >
                      삭제
                    </Button>
                  )}
                  {!notModifiable && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={onSubmitButtonClick}
                      disabled={disabled}
                      startIcon={<Edit />}
                    >
                      수정
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={onSubmitButtonClick}
                  disabled={disabled}
                  startIcon={<Add />}
                >
                  새 객체 추가
                </Button>
              )}
            </Stack>
          </Box>
        );
      }
    )
  );

export const AdminEditor: React.FC<AppResourceIdType & AdminEditorPropsType> = (
  props
) => (
  <BackendAdminSignInGuard>
    <InnerAdminEditor {...props} />
  </BackendAdminSignInGuard>
);

export const AdminEditorCreateRoutePage: React.FC<
  AppResourceType & AdminEditorPropsType
> = (props) => <AdminEditor {...props} />;

export const AdminEditorModifyRoutePage: React.FC<
  AppResourceType & AdminEditorPropsType
> = Suspense.with({ fallback: <CircularProgress /> }, (props) => {
  const { id } = useParams<{ id?: string }>();
  return <AdminEditor {...props} id={id} />;
});
