import { Button, ButtonProps, Typography } from "@mui/material";
import { FC, isValidElement } from "react";
import { isString } from "remeda";

import { LinkHandler } from "@frontend/common/components/link_handler";

type StyledFullWidthButtonPropType = ButtonProps & {
  /** 클릭 시 이동할 URL. 지정하면 버튼이 링크로 감싸진다. */
  link?: string;
  /** `true`면 primary 의 옅은 배경색을 채운다. (기본은 투명 배경) */
  setBackgroundColor?: boolean;
  /** 배경·호버 색의 불투명도(%) 값. */
  transparency: number;
};

/**
 * 전체 너비를 차지하는 외곽선 버튼. `link` 가 있으면 링크처럼 동작하며,
 * 태그 사이 내용(children) 텍스트는 자동으로 제목(h5) 스타일로 감싸진다.
 * @example <Common__Components__MDX__FullWidthStyledButton link="/store" transparency={10}>티켓 구매하기</Common__Components__MDX__FullWidthStyledButton>
 */
export const StyledFullWidthButton: FC<StyledFullWidthButtonPropType> = ({ link, setBackgroundColor, transparency, ...props }) => {
  let children = props.children;
  if (isValidElement(children) && isString((children.props as { children: unknown }).children))
    children = (children.props as { children: unknown }).children as string;
  if (children) children = <Typography variant="h5" fontSize="1.5rem" children={children} />;

  const button = (
    <Button
      fullWidth
      variant="outlined"
      sx={({ palette }) => ({
        borderRadius: "0.5rem",
        textTransform: "none",
        color: palette.primary.dark,
        borderColor: palette.primary.dark,
        backgroundColor: setBackgroundColor ? `color-mix(in srgb, ${palette.primary.light} ${transparency || 10}%, transparent)` : "transparent",
        "&:hover": {
          backgroundColor: setBackgroundColor
            ? `color-mix(in srgb, ${palette.primary.light} ${transparency || 20}%, transparent)`
            : `color-mix(in srgb, ${palette.primary.light} ${transparency || 10}%, transparent)`,
        },
        "&.MuiButton-sizeLarge": { height: "3.5rem" },
      })}
      {...props}
      children={children}
    />
  );

  return link ? <LinkHandler href={link} children={button} /> : button;
};
