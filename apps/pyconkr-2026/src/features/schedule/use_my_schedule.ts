import { useShopClient, useUserStatus } from "@frontend/shop/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { scheduleStorageKey } from "@apps/pyconkr-2026/consts/local_stroage";

/** localStorage에서 담은 세션 id 목록을 읽습니다. (방어적: 손상/미지원 시 빈 배열) */
const readScheduleIds = (username: string | null): string[] => {
  try {
    const raw = localStorage.getItem(scheduleStorageKey(username));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
};

/** 담은 세션 id 목록을 localStorage에 저장합니다. (중복 제거) */
const writeScheduleIds = (username: string | null, ids: string[]): void => {
  localStorage.setItem(scheduleStorageKey(username), JSON.stringify([...new Set(ids)]));
};

/** select용 모듈 레벨 상수 함수 — 식별자가 안정적이라 react-query가 데이터 변경 시에만 재실행(매 렌더 새 Set 생성 방지). */
const toScheduleSet = (ids: string[]): Set<string> => new Set(ids);

export const SCHEDULE_QUERY_KEY = (username: string | null) => ["query", "my-schedule", username ?? "__anon__"] as const;

/** 로그인된 사용자명(없으면 null)을 반환합니다. useUserStatus는 미인증/실패 시 null을 반환합니다. */
export const useScheduleUsername = (): string | null => {
  const { data } = useUserStatus(useShopClient());
  return data?.meta.is_authenticated ? data.data.user.username : null;
};

/**
 * 담은 세션 멤버십을 Set<sessionId>으로 파생해 O(1)로 판정합니다.
 * initialData로 동기 localStorage 값을 주입해 로딩/undefined 상태가 없습니다(non-suspense).
 */
export const useMyScheduleIds = () => {
  const username = useScheduleUsername();
  return useQuery({
    queryKey: SCHEDULE_QUERY_KEY(username),
    queryFn: (): string[] => readScheduleIds(username),
    initialData: (): string[] => readScheduleIds(username),
    staleTime: Infinity,
    retry: false,
    select: toScheduleSet,
  });
};

type ToggleVariables = { sessionId: string };
type ToggleContext = { previous: string[] };

/**
 * 담기/빼기 토글 mutation. 현재 멤버십으로 add/remove를 분기하고 낙관적으로 캐시를 갱신합니다.
 * meta.invalidates: [] 로 전역 MutationCache의 resetQueries(predicate ?? true)를 무력화해
 * 진행 중인 optimistic 값이 초기화되지 않도록 합니다.
 */
export const useToggleScheduleMutation = () => {
  const username = useScheduleUsername();
  const queryClient = useQueryClient();
  const queryKey = SCHEDULE_QUERY_KEY(username);

  return useMutation<string[], Error, ToggleVariables, ToggleContext>({
    mutationKey: ["mutation", "my-schedule", "toggle", username ?? "__anon__"],
    meta: { invalidates: [] },
    // 캐시가 단일 진실원. onMutate(동기)에서 캐시를 순차적으로 토글하므로, 서로 다른 세션을 빠르게/동시에 토글해도 race 없이 누적됩니다.
    onMutate: ({ sessionId }): ToggleContext => {
      const previous = queryClient.getQueryData<string[]>(queryKey) ?? readScheduleIds(username);
      const next = previous.includes(sessionId) ? previous.filter((id) => id !== sessionId) : [...previous, sessionId];
      queryClient.setQueryData<string[]>(queryKey, next);
      return { previous };
    },
    // mock이므로 캐시의 최신 값을 그대로 localStorage에 영속화. (실제 API로 교체 시 이 부분만 네트워크 호출로 대체)
    mutationFn: (): Promise<string[]> => {
      const next = queryClient.getQueryData<string[]>(queryKey) ?? readScheduleIds(username);
      writeScheduleIds(username, next);
      return Promise.resolve(next);
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData<string[]>(queryKey, context.previous);
      try {
        writeScheduleIds(username, context.previous);
      } catch {
        // 롤백 쓰기 실패는 무시 (캐시는 이미 복구됨)
      }
    },
  });
};
