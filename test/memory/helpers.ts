type GlobalWithGc = typeof globalThis & { readonly gc?: () => void };

function globalWithGc(): GlobalWithGc {
  return globalThis as GlobalWithGc;
}

export function hasGc(): boolean {
  return typeof globalWithGc().gc === 'function';
}

export function heapUsedBytes(): number {
  globalWithGc().gc?.();
  return process.memoryUsage().heapUsed;
}

export function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function mb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
