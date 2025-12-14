import { Injectable, Logger } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';

export interface CircuitBreakerOptions {
  timeout?: number; // If function takes longer, trigger failure (default: 3000ms)
  errorThresholdPercentage?: number; // Error % to open circuit (default: 50)
  resetTimeout?: number; // Time before trying again (default: 30000ms)
  rollingCountTimeout?: number; // Time window for stats (default: 10000ms)
  rollingCountBuckets?: number; // Buckets in time window (default: 10)
  name?: string; // Circuit breaker name for logging
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private circuitBreakers = new Map<string, CircuitBreaker>();

  createCircuitBreaker<T>(
    action: (...args: any[]) => Promise<T>,
    options: CircuitBreakerOptions = {},
  ): CircuitBreaker<any[], T> {
    const defaultOptions = {
      timeout: 3000, // 3 seconds
      errorThresholdPercentage: 50,
      resetTimeout: 30000, // 30 seconds
      rollingCountTimeout: 10000,
      rollingCountBuckets: 10,
      name: 'default',
      ...options,
    };

    const breaker = new CircuitBreaker(action, defaultOptions);

    // Event listeners for monitoring
    breaker.on('open', () => {
      this.logger.warn(`Circuit breaker [${defaultOptions.name}] opened`);
    });

    breaker.on('halfOpen', () => {
      this.logger.log(`Circuit breaker [${defaultOptions.name}] half-open`);
    });

    breaker.on('close', () => {
      this.logger.log(`Circuit breaker [${defaultOptions.name}] closed`);
    });

    breaker.on('failure', (error) => {
      this.logger.error(
        `Circuit breaker [${defaultOptions.name}] failure: ${error.message}`,
      );
    });

    breaker.on('timeout', () => {
      this.logger.warn(`Circuit breaker [${defaultOptions.name}] timeout`);
    });

    breaker.on('fallback', (result) => {
      this.logger.log(`Circuit breaker [${defaultOptions.name}] fallback executed`);
    });

    this.circuitBreakers.set(defaultOptions.name, breaker);
    return breaker;
  }

  getCircuitBreaker(name: string): CircuitBreaker | undefined {
    return this.circuitBreakers.get(name);
  }

  getAllStats() {
    const stats = {};
    this.circuitBreakers.forEach((breaker, name) => {
      stats[name] = breaker.stats;
    });
    return stats;
  }
}