import { styled } from "@mui/material";
import * as React from "react";

type FieldsetProps = React.HTMLAttributes<HTMLFieldSetElement> & {
  legend: string;
};

const StyledFieldsetBase = styled("fieldset")(({ theme }) => ({
  color: theme.palette.grey[700],
  border: `1px solid ${theme.palette.grey[400]}`,
  padding: "1rem",
  borderRadius: "0.25rem",

  "&:hover": {
    borderColor: theme.palette.grey[700],
  },
}));

export const Fieldset: React.FC<FieldsetProps> = ({ legend, children, ...props }) => {
  return (
    <StyledFieldsetBase {...props}>
      <legend style={{ fontSize: "0.75rem", padding: "0 0.25rem" }} children={legend} />
      {children}
    </StyledFieldsetBase>
  );
};
