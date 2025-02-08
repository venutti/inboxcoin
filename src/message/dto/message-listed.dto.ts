import { IsNotEmpty, IsString } from 'class-validator';

export class MessageListedDto {
  id: number;

  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsString()
  @IsNotEmpty()
  fromAccount: string;

  @IsString()
  @IsNotEmpty()
  toAccount: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  createdAt: Date;
}
