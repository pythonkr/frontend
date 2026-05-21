import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { enqueueSnackbar, OptionsObject } from "notistack";
import { FC, ReactNode, useState } from "react";
import { isEmpty, isString } from "remeda";

import { useAppContext } from "@apps/pyconkr-participant-portal/contexts/app_context";
import { BackendAPIClientError } from "@frontend/common/apis";
import { DndFileInput } from "@frontend/common/components";
import { useParticipantPortalClient, useUploadPublicFileMutation } from "@frontend/common/hooks/useParticipantPortalAPI";

type SetUploadedFileAsValueConfirmDialogProps = {
  language: "ko" | "en";
  open: boolean;
  closeAll: () => void;
  setValueAndCloseAll: () => void;
};

const SetUploadedFileAsValueConfirmDialog: FC<SetUploadedFileAsValueConfirmDialogProps> = ({ language, open, closeAll, setValueAndCloseAll }) => {
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
  setFileIdAsValue?: (fileId: string | null) => void;
};

type PublicFileUploadDialogState = {
  selectedFile: File | null;
  uploadedFileId: string | null;
};

export const PublicFileUploadDialog: FC<PublicFileUploadDialogProps> = ({ open, onClose, setFileIdAsValue }) => {
  const { language } = useAppContext();
  const [dialogState, setDialogState] = useState<PublicFileUploadDialogState>({ selectedFile: null, uploadedFileId: null });
  const participantPortalClient = useParticipantPortalClient();
  const uploadPublicFileMutation = useUploadPublicFileMutation(participantPortalClient);

  const addSnackbar = (c: string | ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const titleStr = language === "ko" ? "파일 업로드" : "Upload File";
  const cancelStr = language === "ko" ? "취소" : "Cancel";
  const uploadStr = language === "ko" ? "업로드" : "Upload";
  const fileNotSelectedStr = language === "ko" ? "파일이 선택되지 않았습니다." : "No file selected.";
  const failedToUploadStr = language === "ko" ? "파일 업로드에 실패했습니다." : "Failed to upload file.";
  const loading = uploadPublicFileMutation.isPending;

  const cleanUpDialogState = () => setDialogState({ selectedFile: null, uploadedFileId: null });
  const setFile = (selectedFile: File | null) => setDialogState((ps) => ({ ...ps, selectedFile }));
  const setFileId = (uploadedFileId: string | null) => setDialogState((ps) => ({ ...ps, uploadedFileId }));

  const uploadFile = async () => {
    if (!dialogState.selectedFile) {
      addSnackbar(fileNotSelectedStr, "error");
      return;
    }

    uploadPublicFileMutation.mutate(dialogState.selectedFile, {
      onSuccess: (data) => setFileId(data.id),
      onError: (error) => {
        console.error("Uploading file failed:", error);

        let errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        if (error instanceof BackendAPIClientError) errorMessage = error.message;

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
        open={isString(dialogState.uploadedFileId) && !isEmpty(dialogState.uploadedFileId)}
        closeAll={closeAllDialogs}
        setValueAndCloseAll={setValueAndCloseAllDialogs}
      />
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle children={titleStr} />
        <DialogContent>
          <DndFileInput onFileChange={setFile} language={language} />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" loading={loading} children={cancelStr} color="error" onClick={onClose} />
          <Button variant="contained" loading={loading} children={uploadStr} disabled={!dialogState.selectedFile} onClick={uploadFile} />
        </DialogActions>
      </Dialog>
    </>
  );
};
