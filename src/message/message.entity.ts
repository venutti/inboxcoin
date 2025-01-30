import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fromAccount: string;

  @Column()
  toAccount: string;

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
