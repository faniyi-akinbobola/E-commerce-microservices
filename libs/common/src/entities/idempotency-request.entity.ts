import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('idempotency_requests')
@Index(['idempotencyKey', 'serviceName'], { unique: true })
export class IdempotencyRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  idempotencyKey: string;

  @Column()
  serviceName: string; // 'payment', 'order', 'inventory'

  @Column()
  endpoint: string; // 'create_charge', 'create_order', etc.

  @Column('jsonb', { nullable: true })
  requestBody: any;

  @Column('jsonb', { nullable: true })
  responseData: any;

  @Column({ nullable: true })
  statusCode: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'completed' | 'failed';

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
