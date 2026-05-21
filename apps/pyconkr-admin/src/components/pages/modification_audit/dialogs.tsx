import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { enqueueSnackbar, OptionsObject } from "notistack";
import { FC, ReactNode, useRef } from "react";

import { BackendAPIClientError } from "@frontend/common/apis";
import { Fieldset } from "@frontend/common/components";
import { useApproveModificationAuditMutation, useBackendAdminClient, useRejectModificationAuditMutation } from "@frontend/common/hooks/useAdminAPI";
type SubmitConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  modificationAuditId: string;
};

export const ApproveSubmitConfirmDialog: FC<SubmitConfirmDialogProps> = ({ open, onClose, modificationAuditId }) => {
  const backendAdminClient = useBackendAdminClient();
  const approveModificationAuditMutation = useApproveModificationAuditMutation(backendAdminClient, modificationAuditId);

  const addSnackbar = (c: string | ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const onApproveClick = () => {
    approveModificationAuditMutation.mutate(undefined, {
      onSuccess: () => {
        addSnackbar("수정 심사가 승인되었습니다.", "success");
        onClose();
      },
      onError: (error) => {
        console.error("Approve modification audit failed:", error);
        let errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        if (error instanceof BackendAPIClientError) errorMessage = error.message;
        addSnackbar(errorMessage, "error");
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>수정 심사 승인 확인</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          승인하는 경우 바로 내용이 반영되어 홈페이지에 노출되게 됩니다.
          <br />
          승인 후에는 수정 심사를 반려할 수 없으니, 내용을 한번 더 확인해 주세요.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button loading={approveModificationAuditMutation.isPending} onClick={onClose} color="error" children="취소" />
        <Button loading={approveModificationAuditMutation.isPending} onClick={onApproveClick} color="primary" variant="contained" children="승인" />
      </DialogActions>
    </Dialog>
  );
};

export const RejectSubmitConfirmDialog: FC<SubmitConfirmDialogProps> = ({ open, onClose, modificationAuditId }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const backendAdminClient = useBackendAdminClient();
  const rejectModificationAuditMutation = useRejectModificationAuditMutation(backendAdminClient, modificationAuditId);

  const addSnackbar = (c: string | ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const onRejectClick = () => {
    if (!inputRef.current) return;

    rejectModificationAuditMutation.mutate(inputRef.current.value.trim(), {
      onSuccess: () => {
        addSnackbar("수정 심사가 반려되었습니다.", "success");
        onClose();
      },
      onError: (error) => {
        console.error("Reject modification audit failed:", error);
        let errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        if (error instanceof BackendAPIClientError) errorMessage = error.message;
        addSnackbar(errorMessage, "error");
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>수정 심사 반려 확인</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          수정 심사를 반려하시겠습니까?
          <br />
          반려 후에는 다시 승인할 수 없습니다!
        </Typography>
        <Fieldset legend="반려 사유 (선택)">
          <TextField fullWidth multiline minRows={4} inputRef={inputRef} label="반려 사유" />
        </Fieldset>
      </DialogContent>
      <DialogActions>
        <Button loading={rejectModificationAuditMutation.isPending} onClick={onClose} color="error" children="취소" />
        <Button loading={rejectModificationAuditMutation.isPending} onClick={onRejectClick} color="primary" variant="contained" children="반려" />
      </DialogActions>
    </Dialog>
  );
};
