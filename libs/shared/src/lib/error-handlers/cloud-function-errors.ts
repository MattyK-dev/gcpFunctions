export function cloudFunctionError(error: unknown): void {
  console.error((error as Error).message);
}