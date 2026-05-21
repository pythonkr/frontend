import { Stack, styled } from "@mui/material";
import { FC } from "react";
import { Link } from "react-router-dom";
import { isNonNullish } from "remeda";

import { NestedSiteMapSchema } from "@frontend/common/schemas/backendAPI";
type BreadCrumbPropType = {
  title: string;
  parentSiteMaps: (NestedSiteMapSchema | undefined)[];
};

export const BreadCrumb: FC<BreadCrumbPropType> = ({ title, parentSiteMaps }) => {
  const filtered = parentSiteMaps.slice(1, -1).filter((routeInfo) => isNonNullish(routeInfo));
  return (
    <BreadCrumbContainer>
      <BreadcrumbPathContainer direction="row" alignItems="center">
        {filtered.map(({ name }, index, arr) => {
          const route =
            "/" +
            arr
              .slice(0, index + 1)
              .map((r) => r.route_code)
              .join("/") +
            "/";
          return (
            <span key={index}>
              {index > 0 && <span className="separator">&gt;</span>}
              <Link to={route} children={name} />
            </span>
          );
        })}
      </BreadcrumbPathContainer>
      <PageTitle>{title}</PageTitle>
    </BreadCrumbContainer>
  );
};

const BreadCrumbContainer = styled(Stack)(({ theme }) => ({
  position: "fixed",

  top: "3.625rem",
  width: "100%",
  height: "4.5rem",
  background: "linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.45))",
  boxShadow: "0 1px 10px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",

  gap: "0.25rem",
  justifyContent: "center",
  alignItems: "flex-start",

  zIndex: theme.zIndex.appBar - 1,

  paddingRight: "8rem",
  paddingLeft: "8rem",

  [theme.breakpoints.down("lg")]: {
    paddingRight: "2rem",
    paddingLeft: "2rem",
  },
  [theme.breakpoints.down("sm")]: {
    paddingRight: "1rem",
    paddingLeft: "1rem",
  },
}));

const BreadcrumbPathContainer = styled(Stack)`
  font-size: 9.75px;
  font-weight: 300;
  color: #000000;

  a {
    color: #000000;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .separator {
    color: #4e869d;
    margin: 0 5px;
  }
`;

const PageTitle = styled("h1")`
  font-size: 27px;
  font-weight: 600;
  color: #000000;
  margin: 0;
`;
