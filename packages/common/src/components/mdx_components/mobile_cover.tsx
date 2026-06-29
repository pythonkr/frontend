import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { ButtonBase, Stack, Typography } from "@mui/material";
import { CSSProperties, FC } from "react";

import { Common } from "@frontend/common/hooks";
type MobileCoverProps = {
  /** 전체 화면을 채우는 배경 이미지 경로. */
  coverImageSrc: string;
  /** 배경 위에 겹쳐 올릴 타이틀(로고) 이미지 경로. */
  coverTitleSrc: string;
  /** 배경 이미지의 `object-fit` 값. */
  coverImageObjectFit?: CSSProperties["objectFit"];
  /** 한국어 버튼 문구. */
  buttonTextKo?: string;
  /** 영어 버튼 문구. */
  buttonTextEn?: string;
};

/**
 * 모바일 전용 풀스크린 표지. 배경 이미지·타이틀 이미지·티켓 구매 버튼을 겹쳐 보여준다.
 * 버튼 문구는 현재 언어(ko/en)에 맞춰 자동 선택된다.
 * 레지스트리에는 이미지가 미리 채워진 래퍼로 등록되어 MDX 에서는 prop 없이 사용한다.
 * @example <Common__Components__MDX__MobileCover />
 */
export const MobileCover: FC<MobileCoverProps> = ({
  coverImageSrc,
  coverTitleSrc,
  coverImageObjectFit = "cover",
  buttonTextKo = "티켓 구매하기",
  buttonTextEn = "Buy Ticket",
}) => {
  const { language } = Common.useCommonContext();
  const buttonTitle = language === "ko" ? buttonTextKo : buttonTextEn;

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Stack sx={{ zIndex: 1, position: "absolute", top: 0, left: 0, flex: 1, display: "flex", width: "100%", height: "100%" }}>
        <img
          src={coverImageSrc}
          alt="Mobile Cover Image"
          style={{ flex: 1, width: "100%", height: "100%", objectFit: coverImageObjectFit, objectPosition: "center center" }}
        />
      </Stack>
      <Stack sx={{ zIndex: 2, position: "absolute", top: 96, left: 46 }}>
        <img src={coverTitleSrc} alt="Mobile Cover Title" style={{ objectFit: "contain" }} />
      </Stack>
      <Stack sx={{ zIndex: 3, position: "absolute", top: 351, left: 48 }}>
        <ButtonBase
          sx={{
            flexDirection: "row",
            backgroundColor: "white",
            padding: "10px 20px",
            gap: "10px",
            borderRadius: "10px",
            boxShadow: "0 4px 4px 0px rgba(0, 0, 0, 0.15)",
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: "15px" }}>{buttonTitle}</Typography>
          <ArrowForwardIcon sx={{ height: "15px" }} />
        </ButtonBase>
      </Stack>
    </Stack>
  );
};
