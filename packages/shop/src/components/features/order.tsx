import { OneDetailsOpener, PrimaryStyledDetails } from "@frontend/common/components/mdx_components";
import { useBackendContext } from "@frontend/common/hooks/useAPI";
import {
  AccordionProps,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { enqueueSnackbar, OptionsObject } from "notistack";
import { FC, ReactNode } from "react";
import { useForm, UseFormRegister } from "react-hook-form";
import { isEmpty, isNullish } from "remeda";

import { formatBackendErrorMessage } from "@frontend/shop/apis";
import { OrderProductRelationOptionInput, PriceDisplay, SignInGuard, TicketInfoDisplay } from "@frontend/shop/components/common";
import {
  useIssueCertificateMutation,
  useOneItemRefundMutation,
  useOrderProductPatchMutation,
  useOrderRefundMutation,
  useOrders,
  useShopClient,
  useShopContext,
} from "@frontend/shop/hooks";
import type { Order, OrderProductItem, PaymentHistoryStatus, TicketInfoRequest } from "@frontend/shop/schemas";
import { isOrderProductOptionModifiable, isTicketFormFieldKey, PHONE_REGEX, TICKET_FORM_FIELD } from "@frontend/shop/utils";

const PaymentHistoryStatusKo: {
  [k in PaymentHistoryStatus]: string;
} = {
  pending: "결제 대기중",
  completed: "결제 완료",
  partial_refunded: "부분 환불됨",
  refunded: "환불됨",
};

const PaymentHistoryStatusEn: {
  [k in PaymentHistoryStatus]: string;
} = {
  pending: "Pending",
  completed: "Completed",
  partial_refunded: "Partially refunded",
  refunded: "Refunded",
};

type OrderProductRelationItemProps = Omit<AccordionProps, "children"> & {
  language: "ko" | "en";
  order: Order;
  prodRel: OrderProductItem;
  isPending: boolean;
  oneItemRefundMutation: ReturnType<typeof useOneItemRefundMutation>;
  orderProductPatchMutation: ReturnType<typeof useOrderProductPatchMutation>;
  issueCertificateMutation: ReturnType<typeof useIssueCertificateMutation>;
};

// 티켓 참가자 정보 수정 입력. 읽기 전용은 TicketInfoDisplay가 담당. 저장 버튼은 상위에서 옵션과 통합.
const TicketInfoEditFields: FC<{
  language: "ko" | "en";
  donationAllowed: boolean;
  isPending: boolean;
  register: UseFormRegister<Record<string, string>>;
}> = ({ language, donationAllowed, isPending, register }) => {
  const { ref: nameRef, ...nameRest } = register(TICKET_FORM_FIELD.name, { required: true });
  const { ref: orgRef, ...orgRest } = register(TICKET_FORM_FIELD.organization);
  const { ref: emailRef, ...emailRest } = register(TICKET_FORM_FIELD.email, { required: true });
  const { ref: phoneRef, ...phoneRest } = register(TICKET_FORM_FIELD.phone, { required: true, pattern: PHONE_REGEX });
  const { ref: contributionRef, ...contributionRest } = register(TICKET_FORM_FIELD.contribution_message);

  const participantInfoStr = language === "ko" ? "참가자 정보" : "Participant Information";
  const nameLabel = language === "ko" ? "참가자명" : "Name";
  const orgLabel = language === "ko" ? "소속" : "Organization";
  const emailLabel = language === "ko" ? "이메일" : "Email";
  const phoneLabel = language === "ko" ? "연락처" : "Phone";
  const contributionLabel = language === "ko" ? "후원자 한마디" : "Supporter Message";
  const phoneTitle = language === "ko" ? "전화번호 형식이 올바르지 않습니다. 예: 010-1234-5678" : "Invalid phone number format. e.g., 010-1234-5678";

  return (
    <>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold" }} children={participantInfoStr} />
          </TableRow>
          <TableRow>
            <TableCell sx={{ width: "30%" }} children={nameLabel} />
            <TableCell children={<TextField inputRef={nameRef} {...nameRest} size="small" fullWidth required disabled={isPending} />} />
          </TableRow>
          <TableRow>
            <TableCell children={orgLabel} />
            <TableCell children={<TextField inputRef={orgRef} {...orgRest} size="small" fullWidth disabled={isPending} />} />
          </TableRow>
          <TableRow>
            <TableCell children={emailLabel} />
            <TableCell
              children={<TextField inputRef={emailRef} {...emailRest} size="small" fullWidth type="email" required disabled={isPending} />}
            />
          </TableRow>
          <TableRow>
            <TableCell children={phoneLabel} />
            <TableCell>
              <TextField
                inputRef={phoneRef}
                {...phoneRest}
                size="small"
                fullWidth
                required
                disabled={isPending}
                slotProps={{ htmlInput: { pattern: PHONE_REGEX.source, title: phoneTitle } }}
              />
            </TableCell>
          </TableRow>
          {donationAllowed && (
            <TableRow>
              <TableCell children={contributionLabel} />
              <TableCell
                children={
                  <TextField inputRef={contributionRef} {...contributionRest} size="small" fullWidth multiline minRows={2} disabled={isPending} />
                }
              />
            </TableRow>
          )}
        </TableBody>
      </Table>
      <br />
    </>
  );
};

const OrderProductRelationItem: FC<OrderProductRelationItemProps> = ({
  language,
  order,
  prodRel,
  isPending,
  oneItemRefundMutation,
  orderProductPatchMutation,
  issueCertificateMutation,
  ...props
}) => {
  const ticketInfo = prodRel.ticket_info;
  // 백엔드 PATCH는 status=paid에서만 허용되므로 그 외에는 읽기 전용.
  const ticketEditable = prodRel.is_ticket && prodRel.status === "paid";
  const donationAllowed = prodRel.product.donation_allowed;

  const { control, handleSubmit, getValues, watch, register, formState } = useForm<Record<string, string>>({
    mode: "all",
    defaultValues: {
      [TICKET_FORM_FIELD.name]: ticketInfo?.name ?? "",
      [TICKET_FORM_FIELD.organization]: ticketInfo?.organization ?? "",
      [TICKET_FORM_FIELD.email]: ticketInfo?.email ?? "",
      [TICKET_FORM_FIELD.phone]: ticketInfo?.phone ?? "",
      [TICKET_FORM_FIELD.contribution_message]: ticketInfo?.contribution_message ?? "",
    },
  });
  const modifiableOptionRels = prodRel.options.filter((optionRel) => isOrderProductOptionModifiable(optionRel));
  const currentCustomOptionValues: { [k: string]: string } = modifiableOptionRels.reduce(
    (acc, optionRel) => ({
      ...acc,
      [optionRel.id]: optionRel.custom_response,
    }),
    {}
  );

  const watchedValues = watch();
  const hasModifiedOption = modifiableOptionRels.some((optionRel) => {
    const watchedValue = watchedValues[optionRel.product_option_group.id];
    return watchedValue !== undefined && watchedValue !== optionRel.custom_response;
  });
  // 티켓 필드는 defaultValues로 등록되어 dirtyFields가 원본 대비 변경 여부를 추적 (되돌리면 자동 해제).
  const hasModifiedTicket = ticketEditable && Object.values(TICKET_FORM_FIELD).some((key) => formState.dirtyFields[key]);

  const addSnackbar = (c: string | ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const canModify = modifiableOptionRels.length > 0 || ticketEditable;
  // 저장은 "수정 중인 영역"의 유효성만 봐야 함. errors 키는 옵션(그룹 id) 또는 티켓(__ticket_*).
  // 손대지 않은 레거시 티켓 데이터가 옵션 저장을 막지 않도록 티켓 유효성은 티켓 수정 시에만 적용.
  const optionHasError = Object.keys(formState.errors).some((key) => !isTicketFormFieldKey(key));
  const ticketHasError = Object.keys(formState.errors).some(isTicketFormFieldKey);
  const saveBtnDisabled =
    isPending ||
    order.current_status === "refunded" ||
    (!hasModifiedOption && !hasModifiedTicket) ||
    optionHasError ||
    (hasModifiedTicket && ticketHasError);

  const refundOneProductStr = language === "ko" ? "단일 상품 환불" : "Refund one item";
  const refundedStr = language === "ko" ? "환불됨" : "Refunded";
  const saveStr = language === "ko" ? "저장" : "Save";
  const succeededToRefundOrderStr = language === "ko" ? "주문을 환불했습니다!" : "Successfully refunded the order!";
  const failedToRefundOrderStr =
    language === "ko"
      ? "주문에 포함된 상품을 환불하는 중 문제가 발생했습니다,\n잠시 후 다시 시도해주세요."
      : "An error occurred while refunding the order,\nplease try again later.";
  const succeededToSaveStr = language === "ko" ? "변경 사항을 저장했습니다." : "Changes have been saved.";
  const failedToSaveStr =
    language === "ko"
      ? "변경 사항 저장 중 문제가 발생했습니다,\n잠시 후 다시 시도해주세요."
      : "An error occurred while saving the changes,\nplease try again later.";

  const refundBtnDisabled = isPending || !isNullish(prodRel.not_refundable_reason);
  const refundBtnText = isNullish(prodRel.not_refundable_reason)
    ? refundOneProductStr
    : prodRel.status === "refunded"
      ? refundedStr
      : prodRel.not_refundable_reason;

  const scanCodeDisabled = isPending || prodRel.status === "refunded";
  const scanCodeBtnText = language === "ko" ? "등록 QR 코드" : "Registeration QR Code";

  const certificateDownloadable = prodRel.certificate_status === "issuable" || prodRel.certificate_status === "issued";
  const certificateBtnText = language === "ko" ? "참가확인서 다운로드" : "Download Certificate";
  const failedToIssueCertificateStr =
    language === "ko"
      ? "참가확인서를 발급하는 중 문제가 발생했습니다,\n잠시 후 다시 시도해주세요."
      : "An error occurred while issuing the certificate,\nplease try again later.";

  const issueCertificate = () =>
    issueCertificateMutation.mutate(
      { order_id: order.id, order_product_relation_id: prodRel.id },
      {
        onSuccess: ({ download_url }) => window.open(download_url, "_blank", "noopener,noreferrer"),
        onError: (error) => addSnackbar(formatBackendErrorMessage(error, failedToIssueCertificateStr), "error"),
      }
    );

  const refundOneItem = () =>
    oneItemRefundMutation.mutate(
      { order_id: order.id, order_product_relation_id: prodRel.id },
      {
        onSuccess: () => addSnackbar(succeededToRefundOrderStr, "success"),
        onError: (error) => addSnackbar(formatBackendErrorMessage(error, failedToRefundOrderStr), "error"),
      }
    );
  // 변경된 옵션 답변과 (티켓이면) 참가자 정보를 한 번의 PATCH로 저장.
  const onSave = () => {
    const values = getValues();
    // 수정 가능한 옵션 중 폼 값이 원본과 달라진 것만. 폼 필드명은 product_option_group의 id.
    const options = modifiableOptionRels.flatMap((optionRel) => {
      const value = values[optionRel.product_option_group.id];
      return value !== undefined && value !== currentCustomOptionValues[optionRel.id]
        ? [{ order_product_option_relation: optionRel.id, custom_response: value }]
        : [];
    });

    let ticket_info: TicketInfoRequest | undefined;
    if (hasModifiedTicket && ticketInfo) {
      ticket_info = {
        name: values[TICKET_FORM_FIELD.name],
        email: values[TICKET_FORM_FIELD.email],
        phone: values[TICKET_FORM_FIELD.phone],
        organization: values[TICKET_FORM_FIELD.organization] ?? "",
      };
      if (donationAllowed) ticket_info.contribution_message = values[TICKET_FORM_FIELD.contribution_message] ?? "";
    }

    if (!options.length && !ticket_info) return;

    orderProductPatchMutation.mutate(
      {
        order_id: order.id,
        order_product_relation_id: prodRel.id,
        ...(options.length ? { options } : {}),
        ...(ticket_info ? { ticket_info } : {}),
      },
      {
        onSuccess: () => addSnackbar(succeededToSaveStr, "success"),
        onError: (error) => addSnackbar(formatBackendErrorMessage(error, failedToSaveStr), "error"),
      }
    );
  };

  const actionButtons = (
    <Stack direction="column" flexGrow={1} spacing={2}>
      {prodRel.scancode_url && (
        <a href={prodRel.scancode_url} target="_blank" rel="noopener noreferrer">
          <Button variant="contained" fullWidth children={scanCodeBtnText} disabled={scanCodeDisabled} />
        </a>
      )}
      {certificateDownloadable && (
        <Button variant="contained" fullWidth onClick={issueCertificate} disabled={isPending} children={certificateBtnText} />
      )}
      <Stack direction="row" flexGrow={1} spacing={2}>
        {canModify && (
          <Button variant="contained" fullWidth onClick={onSave} disabled={saveBtnDisabled}>
            {saveStr}
          </Button>
        )}
        <Button variant="contained" fullWidth onClick={refundOneItem} disabled={refundBtnDisabled}>
          {refundBtnText}
        </Button>
      </Stack>
    </Stack>
  );

  return (
    <PrimaryStyledDetails {...props} key={prodRel.id} summary={<Typography variant="h6">{prodRel.product.name}</Typography>} actions={actionButtons}>
      {prodRel.ticket_info &&
        (ticketEditable ? (
          <TicketInfoEditFields language={language} donationAllowed={donationAllowed} isPending={isPending} register={register} />
        ) : (
          <TicketInfoDisplay language={language} ticketInfo={prodRel.ticket_info} />
        ))}
      <form onSubmit={handleSubmit(() => {})}>
        <Stack spacing={2} sx={{ width: "100%" }}>
          {prodRel.options.map((optionRel) => (
            <OrderProductRelationOptionInput
              key={optionRel.product_option_group.id + (optionRel.product_option?.id || "")}
              optionRel={optionRel}
              disabled={isPending}
              control={control}
            />
          ))}
        </Stack>
      </form>
    </PrimaryStyledDetails>
  );
};

type OrderItemProps = Omit<AccordionProps, "children"> & { order: Order; disabled?: boolean };

const OrderItem: FC<OrderItemProps> = ({ order, disabled, ...props }) => {
  const { language } = useShopContext();
  const { backendApiDomain } = useBackendContext();
  const shopAPIClient = useShopClient();
  const orderRefundMutation = useOrderRefundMutation(shopAPIClient);
  const oneItemRefundMutation = useOneItemRefundMutation(shopAPIClient);
  const orderProductPatchMutation = useOrderProductPatchMutation(shopAPIClient);
  const issueCertificateMutation = useIssueCertificateMutation(shopAPIClient);

  const addSnackbar = (c: string | ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const PaymentHistoryStatus = language === "ko" ? PaymentHistoryStatusKo : PaymentHistoryStatusEn;
  const refundFullOrderStr = language === "ko" ? "주문 전체 환불" : "Refund full order";
  const orderFullyRefundedStr = language === "ko" ? "주문 전체 환불됨" : "Order fully refunded";
  const receiptStr = language === "ko" ? "영수증" : "Receipt";
  const orderedPriceStr = language === "ko" ? "주문 결제 금액" : "Ordered Price";
  const statusStr = language === "ko" ? "상태" : "Status";
  const productsInOrderStr = language === "ko" ? "주문 상품 목록" : "Products in Order";
  const succeededToRefundFullOrderStr = language === "ko" ? "주문을 환불했습니다!" : "Successfully refunded the order!";
  const failedToRefundFullOrderStr =
    language === "ko"
      ? "주문 환불 중 문제가 발생했습니다,\n잠시 후 다시 시도해주세요."
      : "An error occurred while refunding the order,\nplease try again later.";

  const refundOrder = () =>
    orderRefundMutation.mutate(
      { order_id: order.id },
      {
        onSuccess: () => addSnackbar(succeededToRefundFullOrderStr, "success"),
        onError: (error) => addSnackbar(formatBackendErrorMessage(error, failedToRefundFullOrderStr), "error"),
      }
    );
  const openReceipt = () => window.open(`${backendApiDomain}/v1/shop/orders/${order.id}/receipt/`, "_blank");

  const isPending =
    disabled ||
    orderRefundMutation.isPending ||
    oneItemRefundMutation.isPending ||
    orderProductPatchMutation.isPending ||
    issueCertificateMutation.isPending;
  const refundBtnDisabled = isPending || !isNullish(order.not_fully_refundable_reason);
  const receipyBtnDisabled = isPending || order.current_status === "pending";
  const btnText = isNullish(order.not_fully_refundable_reason)
    ? refundFullOrderStr
    : order.current_status === "refunded"
      ? orderFullyRefundedStr
      : order.not_fully_refundable_reason;
  const orderInfoStr = language === "ko" ? "주문 정보" : "Order Information";
  const orderCustomerInfoStr = language === "ko" ? "주문 고객 정보" : "Order Customer Information";
  const customerNameStr = language === "ko" ? "고객명" : "Customer Name";
  const customerOrganizationStr = language === "ko" ? "고객 소속" : "Customer Organization";
  const customerEmailStr = language === "ko" ? "고객 이메일" : "Customer Email";
  const customerPhoneStr = language === "ko" ? "고객 연락처" : "Customer Phone";

  const actionButtons = (
    <>
      <Button variant="contained" fullWidth onClick={openReceipt} disabled={receipyBtnDisabled} children={receiptStr} />
      <Button variant="contained" fullWidth onClick={refundOrder} disabled={refundBtnDisabled} children={btnText} />
    </>
  );

  const isFullyRefunded = order.current_status === "refunded";
  const summaryNode = (
    <Typography variant="h5" sx={isFullyRefunded ? { textDecoration: "line-through", color: "text.disabled" } : undefined}>
      {order.name}
    </Typography>
  );

  return (
    <PrimaryStyledDetails {...props} summary={summaryNode} actions={actionButtons}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ width: "30%" }} />
            <TableCell align="left" sx={{ width: "70%" }} />
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold" }} children={orderInfoStr} />
          </TableRow>
          <TableRow>
            <TableCell children={orderedPriceStr} />
            <TableCell children={<PriceDisplay price={order.first_paid_price} />} />
          </TableRow>
          <TableRow>
            <TableCell children={statusStr} />
            <TableCell children={PaymentHistoryStatus[order.current_status]} />
          </TableRow>
          {order.customer_info && (
            <>
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold" }} children={orderCustomerInfoStr} />
              </TableRow>
              <TableRow>
                <TableCell children={customerNameStr} />
                <TableCell children={order.customer_info.name} />
              </TableRow>
              <TableRow>
                <TableCell children={customerOrganizationStr} />
                <TableCell children={order.customer_info.organization || "N/A"} />
              </TableRow>
              <TableRow>
                <TableCell children={customerEmailStr} />
                <TableCell children={order.customer_info.email} />
              </TableRow>
              <TableRow>
                <TableCell children={customerPhoneStr} />
                <TableCell children={order.customer_info.phone} />
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
      <br />
      <Typography variant="h6">{productsInOrderStr}</Typography>
      <br />
      <Stack spacing={2}>
        <OneDetailsOpener>
          {order.products.map((prodRel) => (
            <OrderProductRelationItem
              key={prodRel.id}
              language={language}
              order={order}
              prodRel={prodRel}
              isPending={isPending}
              oneItemRefundMutation={oneItemRefundMutation}
              orderProductPatchMutation={orderProductPatchMutation}
              issueCertificateMutation={issueCertificateMutation}
            />
          ))}
        </OneDetailsOpener>
      </Stack>
      <br />
      <Divider />
    </PrimaryStyledDetails>
  );
};

type OrderListProps = {
  /** `true`면 주문을 연도별로 묶어서 보여준다. */
  groupByYear?: boolean;
};

/**
 * 로그인 사용자의 주문 내역 목록. 각 주문을 접이식으로 펼쳐 주문 정보·고객 정보·상품 목록을 보여주고,
 * 환불(전체/단일)·영수증·참가확인서 발급·티켓 참가자 정보 수정을 처리한다. 비로그인 시 로그인 안내를 보여준다.
 * @example <Shop__Feature__OrderList groupByYear />
 */
export const OrderList: FC<OrderListProps> = ({ groupByYear = false }) => {
  const WrappedOrderList: FC = () => {
    const { language } = useShopContext();
    const shopAPIClient = useShopClient();
    const { data } = useOrders(shopAPIClient);

    const noOrdersStr = language === "ko" ? "주문 내역이 없어요!" : "No orders yet.";

    if (isEmpty(data)) {
      return (
        <Typography variant="body1" color="error">
          {noOrdersStr}
        </Typography>
      );
    }

    if (!groupByYear) {
      return (
        <OneDetailsOpener>
          {data.map((item) => (
            <OrderItem key={item.id} order={item} />
          ))}
        </OneDetailsOpener>
      );
    }

    const ordersByYear = new Map<number, Order[]>();
    for (const order of data) {
      const year = new Date(order.first_paid_at).getFullYear();
      if (!ordersByYear.has(year)) ordersByYear.set(year, []);
      ordersByYear.get(year)!.push(order);
    }
    const sortedYears = [...ordersByYear.keys()].sort((a, b) => b - a);

    return (
      <Stack spacing={4}>
        {sortedYears.map((year) => (
          <Stack key={year} spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {year}
            </Typography>
            <Divider />
            <OneDetailsOpener>
              {ordersByYear.get(year)!.map((item) => (
                <OrderItem key={item.id} order={item} />
              ))}
            </OneDetailsOpener>
          </Stack>
        ))}
      </Stack>
    );
  };

  return (
    <SignInGuard>
      <ErrorBoundary fallback={<div>주문 내역을 불러오는 중 문제가 발생했습니다.</div>}>
        <Suspense fallback={<CircularProgress />}>
          <Stack spacing={2}>
            <WrappedOrderList />
          </Stack>
        </Suspense>
      </ErrorBoundary>
    </SignInGuard>
  );
};
