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

  @Column({ length: 2000 })
  createEscrowTransactionXdr: string;

  @Column({ nullable: true, length: 2000 })
  cancelPaymentTransactionXdr: string;

  @Column({ nullable: true, length: 2000 })
  receivePaymentTransactionXdr: string;

  @Column({ default: false })
  isTransactionSubmissionPending: boolean;

  @Column({ enum: ['PENDING', 'RECEIVED', 'CANCELED'] })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
