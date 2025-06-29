import * as Common from "@frontend/common";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { enqueueSnackbar, OptionsObject } from "notistack";
import * as React from "react";

import { useAppContext } from "../../contexts/app_context";

type ChangePasswordDialogProps = {
  open: boolean;
  onClose: () => void;
};

type PasswordFormDataType = {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
};

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ open, onClose }) => {
  const formRef = React.useRef<HTMLFormElement>(null);
  const { language } = useAppContext();
  const participantPortalClient = Common.Hooks.BackendParticipantPortalAPI.useParticipantPortalClient();
  const changePasswordMutation = Common.Hooks.BackendParticipantPortalAPI.useChangePasswordMutation(participantPortalClient);

  const addSnackbar = (c: string | React.ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const titleStr = language === "ko" ? "비밀번호 변경" : "Change Password";
  const prevPasswordLabel = language === "ko" ? "이전 비밀번호" : "Previous Password";
  const newPasswordLabel = language === "ko" ? "새 비밀번호" : "New Password";
  const confirmPasswordLabel = language === "ko" ? "새 비밀번호 확인" : "Confirm New Password";
  const cancelStr = language === "ko" ? "취소" : "Cancel";
  const submitStr = language === "ko" ? "수정" : "Apply changes";
  const passwordChangedStr = language === "ko" ? "비밀번호가 성공적으로 변경되었습니다." : "Password changed successfully.";

  const handleSubmit = () => {
    if (!Common.Utils.isFormValid(formRef.current)) return;

    const formData = Common.Utils.getFormValue<PasswordFormDataType>({ form: formRef.current });
    changePasswordMutation.mutate(formData, {
      onSuccess: () => {
        addSnackbar(passwordChangedStr, "success");
        onClose();
      },
      onError: (error) => {
        console.error("Change password failed:", error);

        let errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        if (error instanceof Common.BackendAPIs.BackendAPIClientError) errorMessage = error.message;

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
