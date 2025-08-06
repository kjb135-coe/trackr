export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor() {
    // Enable debug mode in development (based on React's NODE_ENV)
    try {
      // @ts-ignore
      if (process?.env?.NODE_ENV === 'development') {
        this.logLevel = LogLevel.DEBUG;
      }
    } catch {
      // Production environment, keep INFO level
    }
  }

  private log(level: LogLevel, category: string, message: string, data?: any) {
    if (level < this.logLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
    };

    this.logs.push(entry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const logMethod = level >= LogLevel.ERROR ? 'error' : 
                     level >= LogLevel.WARN ? 'warn' : 
                     level >= LogLevel.INFO ? 'info' : 'debug';

    console[logMethod](
      `[${levelNames[level]}] [${category}] ${message}`,
      data || ''
    );
  }

  debug(category: string, message: string, data?: any) {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: any) {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, data?: any) {
    this.log(LogLevel.ERROR, category, message, data);
  }

  // Performance tracking
  time(label: string) {
    console.time(`[PERF] ${label}`);
  }

  timeEnd(label: string) {
    console.timeEnd(`[PERF] ${label}`);
  }

  // Get all logs for debugging
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.info('Logger', 'Logs cleared');
  }
}

export const logger = new Logger();