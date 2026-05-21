import { PermMedia } from "@mui/icons-material";
import { Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, SelectProps, Stack, styled, useMediaQuery } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { ChangeEvent, FC, useRef, useState } from "react";

import { PublicFileUploadDialog } from "@apps/pyconkr-participant-portal/components/dialogs/public_file_upload";
import { useAppContext } from "@apps/pyconkr-participant-portal/contexts/app_context";
import { ErrorFallback, FallbackImage } from "@frontend/common/components";
import { useParticipantPortalClient, usePublicFilesQuery } from "@frontend/common/hooks/useParticipantPortalAPI";

import { Fieldset } from "./fieldset";

type PublicFileSelectorProps = Omit<SelectProps<string | null>, "inputRef">;

const ImageFallback: FC<{ language: "ko" | "en" }> = ({ language }) => (
  <Box children={language === "ko" ? "이미지가 없습니다." : "No image available."} />
);

type PublicFileSelectorState = {
  value?: string | null;
  openUploadDialog?: boolean;
};

const ScaledFallbackImage = styled(FallbackImage)({
  width: "100%",
  maxWidth: "20rem",
  objectFit: "contain",
});

export const PublicFileSelector: FC<PublicFileSelectorProps> = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, ({ value, onChange, disabled, ...props }) => {
    const selectInputRef = useRef<HTMLSelectElement | null>(null);
    const [selectorState, setSelectorState] = useState<PublicFileSelectorState>({ value });
    const { language } = useAppContext();
    const participantPortalClient = useParticipantPortalClient();
    const { data } = usePublicFilesQuery(participantPortalClient);
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

    const setSelectedFile: SelectProps<string | null>["onChange"] = (event, child) => {
      setSelectorState((ps) => ({ ...ps, value: event.target.value }));
      onChange?.(event, child);
    };
    const setSelectInputValue = (value: string | null) => {
      if (selectInputRef.current) selectInputRef.current.value = value || "";

      setSelectorState((ps) => ({ ...ps, value }));
      onChange?.({ target: { value } } as ChangeEvent<HTMLSelectElement & HTMLInputElement>, null);
    };
    const openUploadDialog = () => setSelectorState((ps) => ({ ...ps, openUploadDialog: true }));
    const closeUploadDialog = () => setSelectorState((ps) => ({ ...ps, openUploadDialog: false }));

    const emptyValueStr = language === "ko" ? "선택 안 함" : "Not selected";
    const uploadStr = language === "ko" ? "파일 업로드" : "Upload File";
    const files = [...(props.required ? [] : [{ id: "", file: emptyValueStr, name: emptyValueStr }]), ...data];
    const selectedFile = data.find((file) => file.id === (selectorState.value || ""));

    return (
      <>
        <PublicFileUploadDialog open={!!selectorState.openUploadDialog} onClose={closeUploadDialog} setFileIdAsValue={setSelectInputValue} />
        <Fieldset legend={props.label?.toString() || ""}>
          <Stack direction="column" spacing={2} alignItems="center" justifyContent="center">
            <ScaledFallbackImage
              key={selectedFile?.file || ""}
              src={selectedFile?.file}
              alt="Selected File"
              loading="lazy"
              errorFallback={<ImageFallback language={language} />}
            />
            <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ width: "100%" }} alignItems="center">
              <FormControl fullWidth>
                <InputLabel id="public-file-label">{props.label}</InputLabel>
                <Select
                  labelId="public-file-label"
                  ref={selectInputRef}
                  value={selectorState.value || ""}
                  disabled={disabled}
                  onChange={setSelectedFile}
                  {...props}
                >
                  {files.map((file) => (
                    <MenuItem key={file.id} value={file.id} children={file.name} />
                  ))}
                </Select>
              </FormControl>
              {!disabled && (
                <Button
                  variant="contained"
                  size="small"
                  disabled={disabled}
                  onClick={openUploadDialog}
                  startIcon={<PermMedia />}
                  fullWidth={isMobile}
                  children={uploadStr}
                  sx={{ wordBreak: "keep-all" }}
                />
              )}
            </Stack>
          </Stack>
        </Fieldset>
      </>
    );
  })
);
