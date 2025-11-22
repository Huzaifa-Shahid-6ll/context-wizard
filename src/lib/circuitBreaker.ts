/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascading failures by stopping requests to failing services
 * and allowing them to recover gradually.
 */

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening circuit
  resetTimeout: number; // Time in ms before attempting to close circuit
  monitoringWindow: number; // Time window in ms for tracking failures
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
}

/**
 * Circuit Breaker class
 */
export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private failureTimes: number[] = []; // Track failure times for windowing

  constructor(
    private name: string,
    private options: CircuitBreakerOptions = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringWindow: 60000, // 1 minute
    }
  ) {}

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should be opened/closed
    this.updateState();

    if (this.state === 'open') {
      throw new CircuitBreakerError(
        `Circuit breaker is OPEN for ${this.name}. Service is unavailable.`,
        this.name,
        this.state
      );
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Update circuit state based on current conditions
   */
  private updateState(): void {
    const now = Date.now();

    // Clean old failures outside monitoring window
    this.failureTimes = this.failureTimes.filter(
      time => now - time < this.options.monitoringWindow
    );
    this.failures = this.failureTimes.length;

    if (this.state === 'open') {
      // Check if reset timeout has passed
      if (
        this.lastFailureTime &&
        now - this.lastFailureTime >= this.options.resetTimeout
      ) {
        this.state = 'half-open';
        this.failures = 0; // Reset failure count for half-open state
      }
    } else if (this.state === 'half-open') {
      // Half-open state: next request will determine if we close or reopen
      // State will be updated in onSuccess/onFailure
    } else {
      // Closed state: check if we should open
      if (this.failures >= this.options.failureThreshold) {
        this.state = 'open';
        this.lastFailureTime = now;
      }
    }
  }

  /**
   * Handle successful request
   */
  private onSuccess(): void {
    this.successes++;
    this.lastSuccessTime = Date.now();

    if (this.state === 'half-open') {
      // Success in half-open state: close the circuit
      this.state = 'closed';
      this.failures = 0;
      this.failureTimes = [];
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(): void {
    const now = Date.now();
    this.failures++;
    this.lastFailureTime = now;
    this.failureTimes.push(now);

    // Clean old failures
    this.failureTimes = this.failureTimes.filter(
      time => now - time < this.options.monitoringWindow
    );
    this.failures = this.failureTimes.length;

    if (this.state === 'half-open') {
      // Failure in half-open state: reopen the circuit
      this.state = 'open';
    } else if (this.state === 'closed' && this.failures >= this.options.failureThreshold) {
      // Too many failures: open the circuit
      this.state = 'open';
    }
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
    };
  }

  /**
   * Reset circuit breaker to closed state
   */
  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.failureTimes = [];
  }
}

/**
 * Circuit Breaker Error
 */
export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public circuitName: string,
    public state: CircuitState
  ) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

/**
 * Circuit breaker instances for different services
 */
const circuitBreakers = new Map<string, CircuitBreaker>();

/**
 * Get or create a circuit breaker for a service
 */
export function getCircuitBreaker(
  serviceName: string,
  options?: CircuitBreakerOptions
): CircuitBreaker {
  if (!circuitBreakers.has(serviceName)) {
    circuitBreakers.set(
      serviceName,
      new CircuitBreaker(serviceName, options)
    );
  }
  return circuitBreakers.get(serviceName)!;
}

