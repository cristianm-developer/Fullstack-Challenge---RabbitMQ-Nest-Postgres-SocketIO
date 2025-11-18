import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('auth')
export class Auth {

    @PrimaryGeneratedColumn('increment')
    id!: number;
    @Column({
        unique: true,
        length: 255,
        type: 'varchar',
        nullable: false,
    })
    email!: string;
    @Column({
        unique: true,
        length: 255,
        type: 'varchar',
        nullable: false,
    })
    username!: string;
    @Column({
        length: 255,
        type: 'varchar',
        nullable: false,
    })
    password!: string;
    @CreateDateColumn()
    createdAt!: Date;
    @UpdateDateColumn()
    updatedAt!: Date;
}