import { useBackendAdminClient, useResetUserPasswordMutation } from "@frontend/common/hooks/useAdminAPI";
import { KeyOff } from "@mui/icons-material";
import { Button, ButtonProps, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { AdminEditor } from "@apps/pyconkr-admin/components/layouts/admin_editor";
import { addErrorSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

import { EmailAddressSection } from "./email_address_section";
import { McpTokenSection } from "./mcp_token_section";
import { PasswordResultDialog } from "./password_result_dialog";
import { ShopOrderSection } from "./shop_order_section";
import { SocialAccountSection } from "./social_account_section";

type PageStateType = {
  isConfirmDialogOpen: boolean;
  isResultDialogOpen: boolean;
  newPassword: string | null;
  createdUserId: string | null;
};

export const AdminUserExtEditor: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const [pageState, setPageState] = useState<PageStateType>({
      isConfirmDialogOpen: false,
      isResultDialogOpen: false,
      newPassword: null,
      createdUserId: null,
    });
    const openConfirmDialog = () => setPageState((ps) => ({ ...ps, isConfirmDialogOpen: true }));
    const closeConfirmDialog = () => setPageState((ps) => ({ ...ps, isConfirmDialogOpen: false }));
    const closeResultDialog = () => {
      const userId = pageState.createdUserId;
      setPageState((ps) => ({ ...ps, isResultDialogOpen: false, newPassword: null, createdUserId: null }));
      if (userId) navigate(`/user/userext/${userId}`);
    };

    const backendAdminClient = useBackendAdminClient();
    const useResetPasswordMutation = useResetUserPasswordMutation(backendAdminClient, id || "");

    const resetUserPassword = () => {
      closeConfirmDialog();
      if (id) {
        useResetPasswordMutation.mutate(undefined, {
          onSuccess: (data) => {
            setPageState((ps) => ({
              ...ps,
              isResultDialogOpen: true,
              newPassword: data.password,
            }));
          },
          onError: addErrorSnackbar,
        });
      }
    };

    const onCreated = (data: Record<string, string>) => {
      setPageState((ps) => ({
        ...ps,
        isResultDialogOpen: true,
        newPassword: data.password,
        createdUserId: data.id,
      }));
    };

    const resetUserPasswordButton: ButtonProps = {
      variant: "outlined",
      color: "error",
      size: "small",
      startIcon: <KeyOff />,
      children: "비밀번호 초기화",
      onClick: () => id && openConfirmDialog(),
    };

    const stripNestedFromSubmit = (data: Record<string, string>) => {
      delete data.email_addresses;
      delete data.social_accounts;
    };

    return (
      <>
        <Dialog open={pageState.isConfirmDialogOpen}>
          <DialogTitle>비밀번호 초기화</DialogTitle>
          <DialogContent>
            <DialogContentText>정말 이 사용자의 비밀번호를 초기화하시겠습니까?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="error" onClick={closeConfirmDialog} autoFocus>
              취소
            </Button>
            <Button onClick={resetUserPassword}>초기화</Button>
          </DialogActions>
        </Dialog>

        <PasswordResultDialog open={pageState.isResultDialogOpen} password={pageState.newPassword} onClose={closeResultDialog} />

        <AdminEditor
          app="user"
          resource="userext"
          id={id}
          hidingFields={["email_addresses", "social_accounts"]}
          extraActions={[resetUserPasswordButton]}
          onCreated={onCreated}
          beforeSubmit={stripNestedFromSubmit}
        >
          {id && (
            <>
              <McpTokenSection userId={id} />
              <EmailAddressSection userId={id} />
              <SocialAccountSection userId={id} />
              <ShopOrderSection userId={id} />
            </>
          )}
          <br />
        </AdminEditor>
      </>
    );
  })
);
