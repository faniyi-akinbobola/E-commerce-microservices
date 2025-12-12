import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order-entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column()
  name: string; // snapshot (avoid relying on product service later)

  @Column('decimal')
  price: number; // snapshot

  @Column()
  quantity: number;

  @ManyToOne(() => Order, order => order.items)
  order: Order;
}
