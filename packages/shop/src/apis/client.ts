import * as Common from "@frontend/common";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import * as R from "remeda";

import ShopSchemas from "../schemas";

const DEFAULT_ERROR_MESSAGE = "알 수 없는 문제가 발생했습니다, 잠시 후 다시 시도해주세요.";
const DEFAULT_ERROR_RESPONSE = {
  type: "unknown",
  errors: [{ code: "unknown", detail: DEFAULT_ERROR_MESSAGE, attr: null }],
};

export class ShopAPIClientError extends Error {
  readonly name = "ShopAPIError";
  readonly status: number;
  readonly detail: ShopSchemas.ErrorResponseSchema;
  readonly originalError: unknown;

  constructor(error?: unknown) {
    let message: string = DEFAULT_ERROR_MESSAGE;
    let detail: ShopSchemas.ErrorResponseSchema = DEFAULT_ERROR_RESPONSE;
    let status = -1;

    if (axios.isAxiosError(error)) {
      const response = error.response;

      if (response) {
        status = response.status;
        detail = ShopSchemas.isObjectErrorResponseSchema(response.data)
          ? response.data
          : {
              type: "axios_error",
              errors: [
                {
                  code: "unknown",
                  detail: R.isString(response.data) ? response.data : DEFAULT_ERROR_MESSAGE,
                  attr: null,
                },
              ],
            };
      }
    } else if (error instanceof Error) {
      message = error.message;
      detail = {
        type: error.name || typeof error || "unknown",
        errors: [{ code: "unknown", detail: error.message, attr: null }],
      };
    }

    super(message);
    this.originalError = error || null;
    this.status = status;
    this.detail = detail;
  }

  isRequiredAuth(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

type AxiosRequestWithoutPayload = <T = unknown, R = AxiosResponse<T>, D = unknown>(url: string, config?: AxiosRequestConfig<D>) => Promise<R>;
type AxiosRequestWithPayload = <T = unknown, R = AxiosResponse<T>, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>) => Promise<R>;

export class ShopAPIClient {
  readonly baseURL: string;
  readonly language: "ko" | "en";
  protected readonly csrfCookieName: string;
  private readonly shopAPI: AxiosInstance;

  constructor(baseURL: string, csrfCookieName: string, timeout: number, language: "ko" | "en") {
    this.baseURL = baseURL;
    this.language = language;
    this.csrfCookieName = csrfCookieName;
    this.shopAPI = axios.create({
      baseURL,
      timeout,
      withCredentials: true,
      headers: { "Content-Type": "application/json", "Accept-Language": language },
    });
    this.shopAPI.interceptors.request.use(
      (config) => {
        config.headers["x-csrftoken"] = this.getCSRFToken();
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  _safe_request_without_payload(requestFunc: AxiosRequestWithoutPayload): AxiosRequestWithoutPayload {
    return async <T = unknown, R = AxiosResponse<T>, D = unknown>(url: string, config?: AxiosRequestConfig<D>) => {
      try {
        return await requestFunc<T, R, D>(url, config);
      } catch (error) {
        throw new ShopAPIClientError(error);
      }
    };
  }

  _safe_request_with_payload(requestFunc: AxiosRequestWithPayload): AxiosRequestWithPayload {
    return async <T = unknown, R = AxiosResponse<T>, D = unknown>(url: string, data: D, config?: AxiosRequestConfig<D>) => {
      try {
        return await requestFunc<T, R, D>(url, data, config);
      } catch (error) {
        throw new ShopAPIClientError(error);
      }
    };
  }

  getCSRFToken(): string | undefined {
    return Common.Utils.getCookie(this.csrfCookieName);
  }

  async get<T, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<T> {
    return (await this._safe_request_without_payload(this.shopAPI.get)<T, AxiosResponse<T>, D>(url, config)).data;
  }
  async post<T, D>(url: string, data: D, config?: AxiosRequestConfig<D>): Promise<T> {
    return (await this._safe_request_with_payload(this.shopAPI.post)<T, AxiosResponse<T>, D>(url, data, config)).data;
  }
  async put<T, D>(url: string, data: D, config?: AxiosRequestConfig<D>): Promise<T> {
    return (await this._safe_request_with_payload(this.shopAPI.put)<T, AxiosResponse<T>, D>(url, data, config)).data;
  }
  async patch<T, D>(url: string, data: D, config?: AxiosRequestConfig<D>): Promise<T> {
    return (await this._safe_request_with_payload(this.shopAPI.patch)<T, AxiosResponse<T>, D>(url, data, config)).data;
  }
  async delete<T, D = unknown>(url: string, config?: AxiosRequestConfig<D>): Promise<T> {
    return (await this._safe_request_without_payload(this.shopAPI.delete)<T, AxiosResponse<T>, D>(url, config)).data;
  }
}
