/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from '../message/message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  publicKey: string;

  @OneToMany((type) => Message, (message) => message.fromAccount)
  messagesSent: Message[];

  @OneToMany((type) => Message, (message) => message.toAccount)
  messagesReceived: Message[];
}
