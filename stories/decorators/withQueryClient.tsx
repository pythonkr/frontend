import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Decorator } from "@storybook/react-vite";
import * as React from "react";

/**
 * story parameters에 `mockSessions`를 넣으면 React Query 캐시에 주입합니다.
 *
 * 예시:
 * export const Default: Story = {
 *   parameters: { mockSessions: [...] },
 * };
 */
export const withQueryClient: Decorator = (Story, context) => {
  const [queryClient] = React.useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
      },
    });

    const mockSessions: unknown[] | undefined = context.parameters.mockSessions;
    if (mockSessions) {
      // language는 withCommonContext에서 "ko"로 고정되어 있으므로 "ko" 키만 주입합니다.
      client.setQueryData(["query", "session", "list", "ko"], mockSessions);
    }

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
};
