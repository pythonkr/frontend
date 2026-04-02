import { Box, Chip, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import * as React from "react";

type ColorSwatchProps = {
  label: string;
  color: string;
  textColor?: string;
};

const ColorSwatch: React.FC<ColorSwatchProps> = ({
  label,
  color,
  textColor = "#fff",
}) => (
  <Box
    sx={{
      bgcolor: color,
      color: textColor,
      px: 2,
      py: 1.5,
      borderRadius: 1,
      minWidth: 140,
      display: "flex",
      flexDirection: "column",
      gap: 0.5,
    }}
  >
    <Typography variant="caption" sx={{ fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography variant="caption" sx={{ opacity: 0.8, fontFamily: "monospace" }}>
      {color}
    </Typography>
  </Box>
);

type PaletteGroupProps = {
  title: string;
  colors: { label: string; color: string; textColor?: string }[];
};

const PaletteGroup: React.FC<PaletteGroupProps> = ({ title, colors }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
      {title}
    </Typography>
    <Stack direction="row" flexWrap="wrap" gap={1}>
      {colors.map(({ label, color, textColor }) => (
        <ColorSwatch
          key={label}
          label={label}
          color={color}
          textColor={textColor}
        />
      ))}
    </Stack>
  </Box>
);

export const ThemePalette: React.FC = () => {
  const theme = useTheme();
  const p = theme.palette;

  const groups: PaletteGroupProps[] = [
    {
      title: "Primary",
      colors: [
        { label: "main", color: p.primary.main },
        { label: "light", color: p.primary.light, textColor: "#333" },
        { label: "dark", color: p.primary.dark },
      ],
    },
    {
      title: "Secondary",
      colors: [
        { label: "main", color: p.secondary.main },
        { label: "light", color: p.secondary.light, textColor: "#333" },
        { label: "dark", color: p.secondary.dark },
      ],
    },
    {
      title: "Highlight",
      colors: p.highlight
        ? [
            { label: "main", color: p.highlight.main },
            { label: "light", color: p.highlight.light, textColor: "#333" },
            { label: "dark", color: p.highlight.dark },
          ]
        : [],
    },
    {
      title: "Text",
      colors: [
        {
          label: "primary",
          color: p.text.primary,
          textColor: p.background.default,
        },
        {
          label: "secondary",
          color: p.text.secondary,
          textColor: p.background.default,
        },
        {
          label: "disabled",
          color: p.text.disabled,
          textColor: p.background.default,
        },
      ],
    },
    {
      title: "Status",
      colors: [
        { label: "error", color: p.error.main },
        { label: "warning", color: p.warning.main },
        { label: "info", color: p.info.main },
        { label: "success", color: p.success.main },
      ],
    },
    {
      title: "Background",
      colors: [
        {
          label: "default",
          color: p.background.default,
          textColor: p.text.primary,
        },
        {
          label: "paper",
          color: p.background.paper,
          textColor: p.text.primary,
        },
      ],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Theme Palette
      </Typography>
      {groups.map((group) => (
        <PaletteGroup key={group.title} {...group} />
      ))}

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Chip 컴포넌트 (MUI 테마 적용 확인)
        </Typography>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Chip label="Default" />
          <Chip label="Primary" color="primary" />
          <Chip label="Secondary" color="secondary" />
          <Chip label="Error" color="error" />
          <Chip label="Warning" color="warning" />
          <Chip label="Info" color="info" />
          <Chip label="Success" color="success" />
          <Chip label="Primary Outlined" color="primary" variant="outlined" />
        </Stack>
      </Box>
    </Box>
  );
};
