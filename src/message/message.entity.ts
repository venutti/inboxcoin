import { User } from 'src/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.messagesSent)
  fromAccount: User;

  @ManyToOne(() => User, (user) => user.messagesReceived)
  toAccount: User;

  @Column()
  escrowAccount: string;

  @Column()
  message: string;

  @Column()
  amount: string;

  @Column()
  transactionEnvelopeXdr: string;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
