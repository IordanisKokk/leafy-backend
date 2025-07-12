import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BeforeInsert,
} from 'typeorm';

import bcrypt from 'bcrypt';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    passwordHash!: string;

    @BeforeInsert()
    async hashPassword() {
        this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    }

    async matches(password: string) {
        return bcrypt.compare(password, this.passwordHash);
    }
}