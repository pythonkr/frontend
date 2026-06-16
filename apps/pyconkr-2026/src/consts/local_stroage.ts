export const LOCAL_STORAGE_LANGUAGE_KEY = "language";

/** 내 시간표(담은 세션) localStorage 키 prefix. 사용자별로 분리 저장합니다. */
export const SCHEDULE_LS_PREFIX = "pyconkr-2026:my-schedule:";
export const scheduleStorageKey = (username: string | null): string => `${SCHEDULE_LS_PREFIX}${username ?? "__anon__"}`;

/** 로그인 후 복귀할 위치를 잠시 보관하는 sessionStorage 키. */
export const PENDING_REDIRECT_KEY = "pyconkr-2026:pending-redirect";
