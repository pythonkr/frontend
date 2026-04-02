import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";

export const ThemeComponents: React.FC = () => (
  <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 4 }}>
    <section>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Typography
      </Typography>
      <Stack gap={1}>
        <Typography variant="h4">H4 — 파이콘 한국 2025</Typography>
        <Typography variant="h5">H5 — PyCon Korea 2025</Typography>
        <Typography variant="h6">H6 — 발표 세션 목록</Typography>
        <Typography variant="subtitle1">Subtitle1 — 서브타이틀</Typography>
        <Typography variant="body1">
          Body1 — 파이콘 한국은 한국의 파이썬 개발자가 만드는 비영리 개발자
          대상 컨퍼런스입니다.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Body2 — Secondary color text
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Caption — Disabled color text
        </Typography>
      </Stack>
    </section>

    <Divider />

    <section>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Buttons
      </Typography>
      <Stack direction="row" gap={1} flexWrap="wrap">
        <Button variant="contained">Primary Contained</Button>
        <Button variant="contained" color="secondary">
          Secondary
        </Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="outlined" color="secondary">
          Outlined Secondary
        </Button>
        <Button variant="text">Text</Button>
        <Button variant="contained" disabled>
          Disabled
        </Button>
      </Stack>
    </section>

    <Divider />

    <section>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Text Fields
      </Typography>
      <Stack direction="row" gap={2} flexWrap="wrap">
        <TextField label="이름" defaultValue="파이썬" />
        <TextField label="이메일" variant="outlined" />
        <TextField label="비활성화" disabled defaultValue="disabled" />
        <TextField label="에러" error helperText="필수 항목입니다" />
      </Stack>
    </section>

    <Divider />

    <section>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Cards
      </Typography>
      <Stack direction="row" gap={2} flexWrap="wrap">
        <Card sx={{ minWidth: 240 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              세션 카드
            </Typography>
            <Typography variant="body2" color="text.secondary">
              파이썬 프로젝트 구조화 모범 사례와 실전 팁을 공유합니다.
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 240 }} variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              후원사
            </Typography>
            <Typography variant="body2" color="text.secondary">
              파이콘 한국을 후원해 주셔서 감사합니다.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </section>

    <Divider />

    <section>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Alerts
      </Typography>
      <Stack gap={1}>
        <Alert severity="info">정보: 발표 신청이 마감되었습니다.</Alert>
        <Alert severity="success">성공: 참가 신청이 완료되었습니다.</Alert>
        <Alert severity="warning">경고: 좌석이 얼마 남지 않았습니다.</Alert>
        <Alert severity="error">오류: 결제에 실패했습니다.</Alert>
      </Stack>
    </section>

    <Divider />

    <section>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Controls
      </Typography>
      <Stack direction="row" gap={2} alignItems="center">
        <Switch defaultChecked />
        <Switch />
        <Switch disabled />
        <IconButton color="primary" size="large">
          ✦
        </IconButton>
      </Stack>
    </section>
  </Box>
);
