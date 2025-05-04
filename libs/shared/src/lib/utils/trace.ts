import { NextFunction, Request, Response } from "express";
import { VARS, getEnvs } from "./init"

import { AsyncLocalStorage } from "async_hooks";
import { v4 as uuidv4 } from "uuid";

interface TraceContext {
  traceId: string;
  spanId?: string;
  parentSpanId?: string;
}

class TraceContextManager {
  private static instance: TraceContextManager;
  private storage: AsyncLocalStorage<TraceContext>;

  private constructor() {
    this.storage = new AsyncLocalStorage<TraceContext>();
  }

  public static getInstance(): TraceContextManager {
    if (!TraceContextManager.instance) {
      TraceContextManager.instance = new TraceContextManager();
    }
    return TraceContextManager.instance;
  }

  /**
   * Initializes the trace context with a new trace ID and optional span ID.
   * @param traceId The trace ID to set if there is already one.
   * @param spanId Optional span ID to set if there already is one.
   */
  public init(traceId?: string, spanId?: string): TraceContext {
    const context: TraceContext = {
      traceId: traceId || this.generateTraceId(),
      spanId: spanId,
    };
    this.storage.enterWith(context);
    return context;
  }

  /**
   * Generates a new trace ID.
   * @returns A new trace ID.
   */
  private generateTraceId(): string {
    return uuidv4();
  }

  /**
   * Run callback with the current trace context.
   * @param callback The callback function to run.
   */
  public run<T>(context: TraceContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  /**
   * Sets the trace context in the current async context.
   */
  public getContext(): TraceContext | undefined {
    return this.storage.getStore();
  }

  /**
   * Gets the trace ID from the current async context.
   * @returns The trace ID or undefined if not set.
   */
  public getTraceId(): string | undefined {
    const context = this.getContext();
    return context ? context.traceId : undefined;
  }
}

export const traceContextManager = TraceContextManager.getInstance();

/**
 * Middleware to set the trace ID in the request and response headers.
 * It initializes the trace context and sets the trace ID in the response header.
 * @param req The request object.
 * @param res The response object.
 * @param next The next middleware function.
 * @returns The next middleware function.
 * @throws Error if the trace ID is not set.
 */
export function traceMiddleware(req: Request, res: Response, next: NextFunction) {
  const cloudTraceContext = req.headers["x-cloud-trace-context"] as string;
  const traceId = req.headers["x-trace-id"] as string;

  const context = traceContextManager.init(
    traceId as string || cloudTraceContext as string
  );

  res.setHeader("x-trace-id", context.traceId);

  traceContextManager.run(context, () => {
    next();
  });
}