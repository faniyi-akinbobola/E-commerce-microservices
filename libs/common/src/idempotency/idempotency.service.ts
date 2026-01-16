// libs/common/src/services/idempotency.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdempotencyRequest } from '../entities/idempotency-request.entity';

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);

  constructor(
    @InjectRepository(IdempotencyRequest)
    private readonly idempotencyRepo: Repository<IdempotencyRequest>,
  ) {}

  /**
   * Check if request with idempotency key already exists
   * @returns { exists: true, data } if already processed, { exists: false } if new
   */
  async checkIdempotency(
    key: string,
    serviceName: string,
    endpoint: string,
    requestBody?: any,
  ): Promise<{ exists: boolean; data?: any; status?: string }> {
    const existing = await this.idempotencyRepo.findOne({
      where: {
        idempotencyKey: key,
        serviceName,
        endpoint,
      },
    });

    if (!existing) {
      // New request - create pending record
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await this.idempotencyRepo.save({
        idempotencyKey: key,
        serviceName,
        endpoint,
        requestBody,
        status: 'pending',
        expiresAt,
      });

      return { exists: false };
    }

    // Request exists - check status
    if (existing.status === 'completed') {
      this.logger.log(`Idempotent request detected: ${key} - returning cached response`);
      return {
        exists: true,
        data: existing.responseData,
        status: 'completed',
      };
    }

    if (existing.status === 'pending') {
      this.logger.warn(`Duplicate concurrent request detected: ${key}`);
      return {
        exists: true,
        status: 'pending',
      };
    }

    if (existing.status === 'failed') {
      this.logger.log(`Retrying failed request: ${key}`);
      // Allow retry for failed requests
      await this.idempotencyRepo.update({ id: existing.id }, { status: 'pending' });
      return { exists: false };
    }

    return { exists: false };
  }

  /**
   * Mark request as completed with response data
   */
  async markCompleted(
    key: string,
    serviceName: string,
    endpoint: string,
    requestPayload: any,
    result: any,
    statusCode?: number,
  ): Promise<void> {
    await this.idempotencyRepo.update(
      {
        idempotencyKey: key,
        serviceName,
        endpoint,
      },
      {
        responseData: result, // Store the actual response, not the request payload
        statusCode,
        status: 'completed',
      },
    );

    this.logger.log(`Idempotency request marked as completed: ${key}`);
  }

  /**
   * Mark request as failed
   */
  async markFailed(
    key: string,
    serviceName: string,
    endpoint: string,
    errorMessage: string,
  ): Promise<void> {
    await this.idempotencyRepo.update(
      {
        idempotencyKey: key,
        serviceName,
        endpoint,
      },
      {
        status: 'failed',
        errorMessage,
      },
    );

    this.logger.error(`Idempotency request marked as failed: ${key}`);
  }

  /**
   * Clean up expired idempotency records (call this periodically)
   */
  async cleanupExpired(): Promise<number> {
    const result = await this.idempotencyRepo
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();

    this.logger.log(`Cleaned up ${result.affected} expired idempotency records`);
    return result.affected || 0;
  }
}
