export function serviceErrorHandler(error: unknown): void {
  console.error((error as Error).message);
}
