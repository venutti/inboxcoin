import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitMessageTransactionDto {
  @IsString()
  @IsNotEmpty()
  transactionXdr: string;
}
