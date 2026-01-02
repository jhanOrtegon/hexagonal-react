export interface RequestConfig {
  readonly headers?: Record<string, string>;
  readonly params?: Record<string, string | number | boolean>;
  readonly timeout?: number;
}

export interface HttpClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data: unknown, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data: unknown, config?: RequestConfig): Promise<T>;
  patch<T>(url: string, data: unknown, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}

export class HttpError extends Error {
  public readonly status: number;
  public readonly statusText: string;

  constructor(status: number, statusText: string, message?: string) {
    super(message ?? `HTTP Error ${String(status)}: ${statusText}`);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
  }
}

export class FetchHttpClient implements HttpClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor(
    baseUrl: string,
    defaultHeaders: Record<string, string> = {}
  ) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
  }

  public async get<T>(url: string, config?: RequestConfig): Promise<T> {
    const response: Response = await fetch(this.buildUrl(url, config?.params), {
      method: 'GET',
      headers: { ...this.defaultHeaders, ...config?.headers },
      signal: this.createAbortSignal(config?.timeout),
    });

    return await this.handleResponse<T>(response);
  }

  public async post<T>(url: string, data: unknown, config?: RequestConfig): Promise<T> {
    const response: Response = await fetch(this.buildUrl(url, config?.params), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
        ...config?.headers,
      },
      body: JSON.stringify(data),
      signal: this.createAbortSignal(config?.timeout),
    });

    return await this.handleResponse<T>(response);
  }

  public async put<T>(url: string, data: unknown, config?: RequestConfig): Promise<T> {
    const response: Response = await fetch(this.buildUrl(url, config?.params), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
        ...config?.headers,
      },
      body: JSON.stringify(data),
      signal: this.createAbortSignal(config?.timeout),
    });

    return await this.handleResponse<T>(response);
  }

  public async patch<T>(url: string, data: unknown, config?: RequestConfig): Promise<T> {
    const response: Response = await fetch(this.buildUrl(url, config?.params), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
        ...config?.headers,
      },
      body: JSON.stringify(data),
      signal: this.createAbortSignal(config?.timeout),
    });

    return await this.handleResponse<T>(response);
  }

  public async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    const response: Response = await fetch(this.buildUrl(url, config?.params), {
      method: 'DELETE',
      headers: { ...this.defaultHeaders, ...config?.headers },
      signal: this.createAbortSignal(config?.timeout),
    });

    return await this.handleResponse<T>(response);
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const url: URL = new URL(path, this.baseUrl);
    
    if (params !== undefined) {
      Object.entries(params).forEach(([key, value]: [string, string | number | boolean]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new HttpError(response.status, response.statusText);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  }

  private createAbortSignal(timeout?: number): AbortSignal | null {
    if (timeout === undefined) {
      return null;
    }

    const controller: AbortController = new AbortController();
    setTimeout(() => { controller.abort(); }, timeout);
    return controller.signal;
  }
}
