import { Entity, Column, ObjectIdColumn } from "typeorm";


@Entity('categories')
export class Category {
    @ObjectIdColumn()
    _id: string;
    

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    slug: string;

    @Column()
    createdAt: Date;

}

