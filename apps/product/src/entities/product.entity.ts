import { Column, Entity, ObjectIdColumn } from "typeorm";
import { ObjectId } from "mongodb";


@Entity('products')
export class Product {

    @ObjectIdColumn()
    _id: string;

    @Column()
    name : string;

    @Column()
    description: string;

    @Column()
    price: number;

    @Column()
    sku: string; // product code

    @Column()
    slug: string;

    @Column()
    stock: number;

    @Column({
    nullable: true,
    array: true,
    })
    categoryIds: ObjectId[];

    @Column({ nullable: true })
    brand?: string;

    @Column()
    isActive: boolean;

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;
}










