import { DEFAULT_RETRY_POLICY, type RetryPolicy } from "./pipeline-context.js";

const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "application/json, text/javascript, */*; q=0.01",
    "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
};

export class HttpClient {
    private retryPolicy: RetryPolicy;

    constructor(retryPolicy: RetryPolicy = DEFAULT_RETRY_POLICY) {
        this.retryPolicy = retryPolicy;
    }

    async get(
        url: string,
        options?: {
            headers?: Record<string, string>;
            referer?: string;
            timeout?: number;
        }
    ): Promise<string> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= this.retryPolicy.maxRetries; attempt++) {
            try {
                const headers = {
                    ...HEADERS,
                    ...(options?.headers || {}),
                    ...(options?.referer ? { Referer: options.referer } : {}),
                };

                const controller = new AbortController();
                const timeoutId = setTimeout(
                    () => controller.abort(),
                    options?.timeout || 60000
                );

                try {
                    const response = await fetch(url, {
                        headers,
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        if (
                            this.retryPolicy.statusCodes.includes(response.status) &&
                            attempt < this.retryPolicy.maxRetries
                        ) {
                            const delay = Math.pow(
                                this.retryPolicy.backoffFactor,
                                attempt
                            ) * 1000;
                            console.log(
                                `[HTTP] 狀態碼 ${response.status}, ${delay}ms 後重試 (第 ${attempt + 1}/${this.retryPolicy.maxRetries} 次)`
                            );
                            await new Promise((resolve) => setTimeout(resolve, delay));
                            continue;
                        }

                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    return await response.text();
                } finally {
                    clearTimeout(timeoutId);
                }
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                if (attempt < this.retryPolicy.maxRetries) {
                    const delay = Math.pow(
                        this.retryPolicy.backoffFactor,
                        attempt
                    ) * 1000;
                    console.log(
                        `[HTTP] 請求失敗: ${lastError.message}, ${delay}ms 後重試 (第 ${attempt + 1}/${this.retryPolicy.maxRetries} 次)`
                    );
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError || new Error("未知的 HTTP 錯誤");
    }

    async getJson<T>(
        url: string,
        options?: {
            headers?: Record<string, string>;
            referer?: string;
            timeout?: number;
        }
    ): Promise<T> {
        const text = await this.get(url, options);
        return JSON.parse(text);
    }
}

