/**
 * Global Rate Limiter & Concurrency Queue for Google Gemini Free Tier
 * Free Tier constraints:
 * - Max 15 Requests Per Minute (RPM) -> ~4000ms minimum interval between requests
 * - Max 1500 Requests Per Day (RPD)
 */

class GeminiRateLimiter {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private lastCallTime = 0;
  private minIntervalMs = 4200; // 4.2 seconds between requests = max ~14.2 RPM (safely under 15 RPM)

  public async schedule<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallTime;

      if (timeSinceLastCall < this.minIntervalMs) {
        const delay = this.minIntervalMs - timeSinceLastCall;
        await new Promise((r) => setTimeout(r, delay));
      }

      this.lastCallTime = Date.now();
      const nextTask = this.queue.shift();

      if (nextTask) {
        try {
          await nextTask();
        } catch (e) {
          console.error('[RateLimiter] Error in scheduled task:', e);
        }
      }
    }

    this.isProcessing = false;
  }
}

// Global singleton to protect the Free Tier across the Next.js runtime
const globalForLimiter = globalThis as unknown as {
  geminiRateLimiter: GeminiRateLimiter | undefined;
};

export const geminiRateLimiter =
  globalForLimiter.geminiRateLimiter ?? new GeminiRateLimiter();

if (process.env.NODE_ENV !== 'production') {
  globalForLimiter.geminiRateLimiter = geminiRateLimiter;
}

