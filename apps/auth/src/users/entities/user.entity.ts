import { Role } from "common/decorators/roles.decorator";
import { Column, Entity, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { UserAddress } from "../../users-address/entities/user-address.entity";

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    username: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

       // For password reset
    @Column({ nullable: true })
    resetToken: string;

    @Column({ nullable: true, type: 'timestamp' })
    resetTokenExpires: Date;

    @Column({
  type: 'enum',
  enum: ['ADMIN', 'CUSTOMER', 'INVENTORY_MANAGER'],
  default: 'CUSTOMER',
})
role: Role;

  @OneToMany(() => UserAddress, (address) => address.user)
  addresses: UserAddress[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}