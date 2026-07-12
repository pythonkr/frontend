import { Box, FormControl, InputLabel, MenuItem, Pagination, Select, Stack } from "@mui/material";
import { FC } from "react";
import { useSearchParams } from "react-router-dom";

import { PAGE_SIZE_OPTIONS, usePaginationParams } from "@apps/pyconkr-admin/components/elements/pagination";

// 페이지네이션 컨트롤(페이지 이동 + 페이지당 개수). URL의 page/page_size를 직접 갱신한다.
export const ListPagination: FC<{ totalCount: number }> = ({ totalCount }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, pageSize } = usePaginationParams();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handlePageChange = (_: unknown, newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(newPage));
    setSearchParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (newSize: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page_size", String(newSize));
    next.delete("page"); // page boundaries shift, so reset to 1
    setSearchParams(next, { replace: true });
  };

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
      <Box sx={{ width: 140 }} />
      <Pagination count={totalPages} page={page} onChange={handlePageChange} showFirstButton showLastButton />
      <FormControl size="small" sx={{ width: 140 }}>
        <InputLabel>페이지당</InputLabel>
        <Select value={pageSize} label="페이지당" onChange={(e) => handlePageSizeChange(Number(e.target.value))}>
          {PAGE_SIZE_OPTIONS.map((n) => (
            <MenuItem key={n} value={n}>
              {n}개
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};
