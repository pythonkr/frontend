import { getWebInstrumentations, initializeFaro, type Faro, type Instrumentation } from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

export interface InitFaroOptions {
  enabled: boolean;
  tracing?: boolean;
  url: string;
  app: {
    name: string;
    version?: string;
    environment: "development" | "production";
  };
  instrumentationOptions?: {
    /**
     * 분산 트레이싱 헤더(traceparent/tracestate)를 전파할 백엔드 URL 목록.
     * 설정하면 해당 백엔드의 CORS가 traceparent/tracestate 헤더를 허용해야 하고,
     * 프리플라이트(OPTIONS)가 추가된다. 기본은 빈 배열 — 전파하지 않아 백엔드 CORS에 영향 없음.
     * 프론트엔드 단독 스팬은 이 값과 무관하게 수집된다.
     */
    propagateTraceHeaderCorsUrls?: (string | RegExp)[];
  };
}

let faro: Faro | undefined;

export function initFaro(options: InitFaroOptions): Faro | undefined {
  if (faro) return faro;

  const { url, app, enabled, tracing = true, instrumentationOptions = { propagateTraceHeaderCorsUrls: [] } } = options;
  if (!enabled) return undefined;

  const instrumentations: Instrumentation[] = [...getWebInstrumentations()];
  if (tracing) instrumentations.push(new TracingInstrumentation({ instrumentationOptions }));

  faro = initializeFaro({ url, app, instrumentations });
  return faro;
}

export function getFaro(): Faro | undefined {
  return faro;
}
