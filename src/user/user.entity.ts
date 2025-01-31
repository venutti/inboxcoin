import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from '../message/message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  publicKey: string;

  @OneToMany(() => Message, (message) => message.fromAccount)
  messagesSent: Message[];

  @OneToMany(() => Message, (message) => message.toAccount)
  messagesReceived: Message[];
}
