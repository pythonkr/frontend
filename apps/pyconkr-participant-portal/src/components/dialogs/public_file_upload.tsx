import * as Common from "@frontend/common";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { enqueueSnackbar, OptionsObject } from "notistack";
import * as React from "react";

import { useAppContext } from "../../contexts/app_context";

type SetUploadedFileAsValueConfirmDialogProps = {
  language: "ko" | "en";
  open: boolean;
  closeAll: () => void;
  setValueAndCloseAll: () => void;
};

const SetUploadedFileAsValueConfirmDialog: React.FC<SetUploadedFileAsValueConfirmDialogProps> = ({
  language,
  open,
  closeAll,
  setValueAndCloseAll,
}) => {
  const titleStr = language === "ko" ? "파일 업로드 완료" : "File Upload Completed";
  const confirmStr =
    language === "ko" ? "업로드한 파일을 현재 값으로 설정하시겠습니까?" : "Do you want to set the uploaded file as the current value?";
  const yesStr = language === "ko" ? "네" : "Yes";
  const noStr = language === "ko" ? "아니요" : "No";

  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <DialogTitle children={titleStr} />
      <DialogContent children={confirmStr} />
      <DialogActions>
        <Button variant="contained" onClick={closeAll} color="error" children={noStr} />
        <Button variant="contained" onClick={setValueAndCloseAll} children={yesStr} />
      </DialogActions>
    </Dialog>
  );
};

type PublicFileUploadDialogProps = {
  open: boolean;
  onClose: () => void;
  setFileIdAsValue?: (fileId: string | undefined) => void;
};

type PublicFileUploadDialogState = {
  selectedFile?: File | null;
  uploadedFileId?: string;
  openSetValueDialog?: boolean;
};

export const PublicFileUploadDialog: React.FC<PublicFileUploadDialogProps> = ({ open, onClose, setFileIdAsValue }) => {
  const { language } = useAppContext();
  const [dialogState, setDialogState] = React.useState<PublicFileUploadDialogState>({});
  const participantPortalClient = Common.Hooks.BackendParticipantPortalAPI.useParticipantPortalClient();
  const uploadPublicFileMutation = Common.Hooks.BackendParticipantPortalAPI.useUploadPublicFileMutation(participantPortalClient);

  const addSnackbar = (c: string | React.ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const titleStr = language === "ko" ? "파일 업로드" : "Upload File";
  const cancelStr = language === "ko" ? "취소" : "Cancel";
  const uploadStr = language === "ko" ? "업로드" : "Upload";
  const fileNotSelectedStr = language === "ko" ? "파일이 선택되지 않았습니다." : "No file selected.";
  const failedToUploadStr = language === "ko" ? "파일 업로드에 실패했습니다." : "Failed to upload file.";
  const loading = uploadPublicFileMutation.isPending;

  const openSetValueDialog = () => setDialogState((ps) => ({ ...ps, openSetValueDialog: true }));
  const cleanUpDialogState = () => setDialogState({});
  const setFile = (selectedFile?: File | null) => setDialogState((ps) => ({ ...ps, selectedFile }));
  const setFileId = (uploadedFileId?: string) => setDialogState((ps) => ({ ...ps, uploadedFileId }));

  const uploadFile = async () => {
    if (!dialogState.selectedFile) {
      addSnackbar(fileNotSelectedStr, "error");
      return;
    }

    uploadPublicFileMutation.mutate(dialogState.selectedFile, {
      onSuccess: (data) => {
        setFileId(data.id);
        openSetValueDialog();
      },
      onError: (error) => {
        console.error("Uploading file failed:", error);

        let errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        if (error instanceof Common.BackendAPIs.BackendAPIClientError) errorMessage = error.message;

        addSnackbar(`${failedToUploadStr}\n${errorMessage}`, "error");
      },
    });
  };
  const closeAllDialogs = () => {
    cleanUpDialogState();
    onClose();
  };
  const setValueAndCloseAllDialogs = () => {
    setFileIdAsValue?.(dialogState.uploadedFileId);
    closeAllDialogs();
  };

  return (
    <>
      <SetUploadedFileAsValueConfirmDialog
        language={language}
        open={!!dialogState.openSetValueDialog}
        closeAll={closeAllDialogs}
        setValueAndCloseAll={setValueAndCloseAllDialogs}
      />
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle children={titleStr} />
        <DialogContent>
          <Common.Components.DndFileInput onFileChange={setFile} />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" loading={loading} children={cancelStr} color="error" onClick={onClose} />
          <Button variant="contained" loading={loading} children={uploadStr} disabled={!dialogState.selectedFile} onClick={uploadFile} />
        </DialogActions>
      </Dialog>
    </>
  );
};
