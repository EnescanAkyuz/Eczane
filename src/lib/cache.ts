type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const valueCache = new Map<string, CacheEntry<unknown>>();
const inFlightCache = new Map<string, Promise<unknown>>();

function clearExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of valueCache.entries()) {
    if (entry.expiresAt <= now) {
      valueCache.delete(key);
    }
  }
}

export async function withCache<T>(
  key: string,
  ttlMs: number,
  producer: () => Promise<T>,
): Promise<T> {
  if (valueCache.size > 1000) {
    clearExpiredEntries();
  }

  const now = Date.now();
  const cached = valueCache.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const running = inFlightCache.get(key) as Promise<T> | undefined;
  if (running) {
    return running;
  }

  const work = producer()
    .then((value) => {
      valueCache.set(key, {
        expiresAt: now + ttlMs,
        value,
      });
      return value;
    })
    .finally(() => {
      inFlightCache.delete(key);
    });

  inFlightCache.set(key, work);
  return work;
}

