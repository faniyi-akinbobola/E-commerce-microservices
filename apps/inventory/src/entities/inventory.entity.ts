import { Entity, ObjectIdColumn, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inventory')
export class Inventory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    productId: string;

    @Column()
    quantity: number;

    @Column({default: 0})
    reserved: number;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;
}   