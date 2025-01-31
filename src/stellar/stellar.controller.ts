import { Controller, Post } from '@nestjs/common';
import { StellarService } from './stellar.service';

@Controller('stellar')
export class StellarController {
  constructor(private readonly stellarService: StellarService) {}

  @Post('friendbot')
  createAccountWithFriendbot() {
    return this.stellarService.createAccountWithFriendbot();
  }
}
