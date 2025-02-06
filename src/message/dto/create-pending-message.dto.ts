import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePendingMessageDto {
  @IsString()
  @IsNotEmpty()
  fromPublicKey: string;

  @IsString()
  @IsNotEmpty()
  toPublicKey: string;

  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
