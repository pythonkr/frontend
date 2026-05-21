import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { enqueueSnackbar, OptionsObject } from "notistack";
import { FC, ReactNode, useRef } from "react";

import { useAppContext } from "@apps/pyconkr-participant-portal/contexts/app_context";
import { BackendAPIClientError } from "@frontend/common/apis";
import { useChangePasswordMutation, useParticipantPortalClient } from "@frontend/common/hooks/useParticipantPortalAPI";
import { getFormValue, isFormValid } from "@frontend/common/utils";

type ChangePasswordDialogProps = {
  open: boolean;
  onClose: () => void;
};

type PasswordFormDataType = {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
};

export const ChangePasswordDialog: FC<ChangePasswordDialogProps> = ({ open, onClose }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const { language } = useAppContext();
  const participantPortalClient = useParticipantPortalClient();
  const changePasswordMutation = useChangePasswordMutation(participantPortalClient);

  const addSnackbar = (c: string | ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const titleStr = language === "ko" ? "비밀번호 변경" : "Change Password";
  const prevPasswordLabel = language === "ko" ? "이전 비밀번호" : "Previous Password";
  const newPasswordLabel = language === "ko" ? "새 비밀번호" : "New Password";
  const confirmPasswordLabel = language === "ko" ? "새 비밀번호 확인" : "Confirm New Password";
  const cancelStr = language === "ko" ? "취소" : "Cancel";
  const submitStr = language === "ko" ? "수정" : "Apply changes";
  const passwordChangedStr = language === "ko" ? "비밀번호가 성공적으로 변경되었습니다." : "Password changed successfully.";

  const handleSubmit = () => {
    if (!isFormValid(formRef.current)) return;

    const formData = getFormValue<PasswordFormDataType>({ form: formRef.current });
    changePasswordMutation.mutate(formData, {
      onSuccess: () => {
        addSnackbar(passwordChangedStr, "success");
        onClose();
      },
      onError: (error) => {
        console.error("Change password failed:", error);

        let errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        if (error instanceof BackendAPIClientError) errorMessage = error.message;

        addSnackbar(errorMessage, "error");
      },
    });
  };

  const disabled = changePasswordMutation.isPending;

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle children={titleStr} />
      <DialogContent>
        <form ref={formRef}>
          <Stack spacing={2} sx={{ my: 1 }}>
            <TextField fullWidth disabled={disabled} type="password" name="old_password" label={prevPasswordLabel} />
            <TextField fullWidth disabled={disabled} type="password" name="new_password" label={newPasswordLabel} />
            <TextField fullWidth disabled={disabled} type="password" name="new_password_confirm" label={confirmPasswordLabel} />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button loading={disabled} onClick={onClose} color="error" children={cancelStr} />
        <Button loading={disabled} onClick={handleSubmit} color="primary" variant="contained" children={submitStr} />
      </DialogActions>
    </Dialog>
  );
};
