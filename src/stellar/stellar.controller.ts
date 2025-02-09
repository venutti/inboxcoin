import { Controller, Post } from '@nestjs/common';
import { StellarService } from './stellar.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('stellar')
export class StellarController {
  constructor(private readonly stellarService: StellarService) {}

  @ApiOperation({ summary: 'Only for Tesnet. Create a Stellar account.' })
  @Post('friendbot')
  createAccountWithFriendbot() {
    return this.stellarService.createAccountWithFriendbot();
  }
}
