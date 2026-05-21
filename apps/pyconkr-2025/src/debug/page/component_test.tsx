import { Chip, Stack, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { FC } from "react";

import { PrimaryStyledDetails, SecondaryStyledDetails } from "@frontend/common/components/mdx_components";
const HighlightedChip: FC<{ label: string }> = ({ label }) => (
  <Chip
    label={label}
    sx={(theme) => ({
      borderColor: theme.palette.highlight.light,
      backgroundColor: theme.palette.highlight.main,
      color: "#fff",
      fontWeight: 600,
    })}
  />
);

export const ComponentTestPage: FC = () => {
  return (
    <Stack direction="column" spacing={2} sx={{ p: 2 }}>
      <PrimaryStyledDetails summary="자가용 이용시">
        모든 자동차의 출입은 동국대 정문으로만 가능
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <HighlightedChip label="분당방면" />
              </TableCell>
              <TableCell>한남대교 → 남산국립극장 400m 전방 → 동국대 정문</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <HighlightedChip label="강남방면" />
              </TableCell>
              <TableCell>동호대교 → 장충체육관 앞 사거리에서 좌회전 300m 전방 → 동국대 정문</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <HighlightedChip label="용산방면" />
              </TableCell>
              <TableCell>남산 2호터널 통과 후 좌회전 100m 전방 → 동국대 정문</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <HighlightedChip label="동대문방면" />
              </TableCell>
              <TableCell>장충사거리 200m 전방 → 동국대 정문</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </PrimaryStyledDetails>

      <SecondaryStyledDetails summary="자가용 이용시">
        모든 자동차의 출입은 동국대 정문으로만 가능
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <HighlightedChip label="분당방면" />
              </TableCell>
              <TableCell>한남대교 → 남산국립극장 400m 전방 → 동국대 정문</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <HighlightedChip label="강남방면" />
              </TableCell>
              <TableCell>동호대교 → 장충체육관 앞 사거리에서 좌회전 300m 전방 → 동국대 정문</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <HighlightedChip label="용산방면" />
              </TableCell>
              <TableCell>남산 2호터널 통과 후 좌회전 100m 전방 → 동국대 정문</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <HighlightedChip label="동대문방면" />
              </TableCell>
              <TableCell>장충사거리 200m 전방 → 동국대 정문</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </SecondaryStyledDetails>
    </Stack>
  );
};
