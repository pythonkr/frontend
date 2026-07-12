import { useSearchParams } from "react-router-dom";

export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];
export const PAGINATION_PARAM_KEYS = new Set(["page", "page_size"]);

// URL의 page/page_size를 파싱해 목록 쿼리 파라미터로 쓸 값을 돌려준다.
export const usePaginationParams = () => {
  const [searchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.max(1, Number(searchParams.get("page_size")) || DEFAULT_PAGE_SIZE);
  return { page, pageSize };
};
