export interface PipelineStats {
    startTime: Date;
    endTime?: Date;
    totalFetched: number;
    totalProcessed: number;
    totalErrors: number;
    duration?: number;
}

export class PipelineContext {
    stats: PipelineStats;

    constructor() {
        this.stats = {
            startTime: new Date(),
            totalFetched: 0,
            totalProcessed: 0,
            totalErrors: 0,
        };
    }

    log(message: string): void {
        console.log(`[${new Date().toISOString()}] ${message}`);
    }

    error(message: string): void {
        console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
    }

    finish(): void {
        this.stats.endTime = new Date();
        this.stats.duration =
            this.stats.endTime.getTime() - this.stats.startTime.getTime();
    }

    printStats(): void {
        this.log(`
========== Pipeline 統計 ==========
總拉取數: ${this.stats.totalFetched}
總處理數: ${this.stats.totalProcessed}
總錯誤數: ${this.stats.totalErrors}
耗時: ${this.stats.duration}ms
===================================
        `);
    }
}

export interface RetryPolicy {
    maxRetries: number;
    backoffFactor: number;
    statusCodes: number[];
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
    maxRetries: 10,
    backoffFactor: 2,
    statusCodes: [429, 500, 502, 503, 504, 567],
};

