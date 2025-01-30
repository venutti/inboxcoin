import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as StellarSdk from '@stellar/stellar-sdk';

@Injectable()
export class StellarService {
  private server: StellarSdk.Horizon.Server;

  constructor(private readonly configService: ConfigService) {
    this.server = new StellarSdk.Horizon.Server(
      this.configService.get('STELLAR_SERVER_URL') as string,
    );
  }

  async loadAccount(publicKey: string) {
    const account = await this.server.loadAccount(publicKey);
    return account;
  }
}
