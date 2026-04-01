import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { ButtonBase, Stack, Typography } from "@mui/material";
import * as React from "react";
import { useAppContext } from "../../contexts/app_context";
import PyCon2025MobileLogoImage from "../../assets/pyconkr2025_main_cover_image.png";
import PyCon2025MobileLogoTitle from "../../assets/pyconkr2025_main_cover_title.png";

export const MobileCover: React.FC = () => {
  const { language } = useAppContext();
  const buttonTitle = language === "ko" ? "티켓 구매하기" : "Buy Ticket";

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Stack sx={{ zIndex: 1, position: "absolute", top: 0, left: 0, flex: 1, display: "flex", width: "100%" }}>
        <img src={PyCon2025MobileLogoImage} alt="Pycon 2025 Mobile Image" style={{ flex: 1, objectFit: "cover" }} />
      </Stack>
      <Stack sx={{ zIndex: 2, position: "absolute", top: 96, left: 46 }}>
        <img src={PyCon2025MobileLogoTitle} alt="Pycon 2025 Mobile Title" style={{ objectFit: "contain" }} />
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
