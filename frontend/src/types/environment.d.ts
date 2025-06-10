declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_BACKEND_API_URL?: string;
      REACT_APP_MOMO_PARTNER_CODE?: string;
      REACT_APP_MOMO_ACCESS_KEY?: string;
      REACT_APP_MOMO_SECRET_KEY?: string;
      REACT_APP_MOMO_ENDPOINT?: string;
      REACT_APP_MOMO_RETURN_URL?: string;
      REACT_APP_MOMO_NOTIFY_URL?: string;
      REACT_APP_ZALOPAY_APP_ID?: string;
      REACT_APP_ZALOPAY_KEY1?: string;
      REACT_APP_ZALOPAY_KEY2?: string;
      REACT_APP_ZALOPAY_ENDPOINT?: string;
      REACT_APP_ZALOPAY_RETURN_URL?: string;
      REACT_APP_ZALOPAY_CALLBACK_URL?: string;
      REACT_APP_VNPAY_TMN_CODE?: string;
      REACT_APP_VNPAY_HASH_SECRET?: string;
      REACT_APP_VNPAY_URL?: string;
      REACT_APP_VNPAY_RETURN_URL?: string;
      REACT_APP_DEFAULT_CURRENCY?: string;
      REACT_APP_CURRENCY_SYMBOL?: string;
      REACT_APP_PRO_MONTHLY_PRICE?: string;
      REACT_APP_PRO_YEARLY_PRICE?: string;
      REACT_APP_ENTERPRISE_MONTHLY_PRICE?: string;
      REACT_APP_ENTERPRISE_YEARLY_PRICE?: string;
    }
  }

  interface Process {
    env: NodeJS.ProcessEnv;
  }

  const process: Process;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    url?: string;
    method?: string;
    baseURL?: string;
    headers?: any;
    params?: any;
    data?: any;
    timeout?: number;
    responseType?: string;
  }

  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
  }

  export interface AxiosError<T = any> {
    message: string;
    response?: AxiosResponse<T>;
    request?: any;
    config: AxiosRequestConfig;
  }

  export interface AxiosInstance {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    options<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  }

  const axios: AxiosInstance & {
    create(config?: AxiosRequestConfig): AxiosInstance;
    isAxiosError(payload: any): payload is AxiosError;
  };

  export default axios;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

export {};
