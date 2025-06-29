import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import * as React from "react";

import { useAppContext } from "../../contexts/app_context";

type SubmitConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export const SubmitConfirmDialog: React.FC<SubmitConfirmDialogProps> = ({ open, onClose, onSubmit }) => {
  const { language } = useAppContext();

  const titleStr = language === "ko" ? "제출 확인" : "Confirm Submission";
  const content =
    language === "ko" ? (
      <Typography variant="body1" gutterBottom>
        제출하시면 파이콘 준비 위원회에서 검토 후 결과를 알려드립니다.
        <br />
        제출 후에는 수정 심사를 철회 후 다시 수정하셔야 하오니, 내용을 한번 더 확인해 주세요.
        <br />
        계속하시려면 <Chip label="제출" color="primary" size="small" /> 버튼을 클릭해 주세요.
      </Typography>
    ) : (
      <Typography>
        Once you submit, the PyCon Korea organizing committee will review your submission and notify you of the results.
        <br />
        Please double-check your content as you will need to withdraw and resubmit if you wish to make changes after submission.
        <br />
        To continue, please click the <Chip label="Submit" color="primary" size="small" /> button below.
      </Typography>
    );
  const submitStr = language === "ko" ? "제출" : "Submit";
  const cancelStr = language === "ko" ? "취소" : "Cancel";

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle children={titleStr} />
      <DialogContent children={content} />
      <DialogActions>
        <Button onClick={onClose} color="error" children={cancelStr} />
        <Button onClick={onSubmit} color="primary" variant="contained" children={submitStr} />
      </DialogActions>
    </Dialog>
  );
};
