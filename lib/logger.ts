type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  error?: string;
  stack?: string;
}

function formatLog(level: LogLevel, message: string, data?: unknown, error?: Error | null): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data: data || undefined,
    error: error?.message,
    stack: error?.stack,
  };
  return entry;
}

const logger = {
  info(message: string, data?: unknown): void {
    const entry = formatLog("info", message, data);
    console.log(`[INFO] ${entry.message}`, entry.data || "");
  },

  warn(message: string, data?: unknown): void {
    const entry = formatLog("warn", message, data);
    console.warn(`[WARN] ${entry.message}`, entry.data || "");
  },

  error(message: string, error?: Error | unknown | null, data?: unknown): void {
    const err = error instanceof Error ? error : null;
    const entry = formatLog("error", message, data, err);
    console.error(`[ERROR] ${entry.message}`, {
      error: entry.error,
      stack: entry.stack,
      data: entry.data,
    });
  },
};

export default logger;
