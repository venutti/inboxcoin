import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as StellarSdk from '@stellar/stellar-sdk';
import { Account, Keypair } from 'src/@types/stellar';

@Injectable()
export class StellarService {
  private server: StellarSdk.Horizon.Server;

  constructor(private readonly configService: ConfigService) {
    this.server = new StellarSdk.Horizon.Server(
      this.configService.get('STELLAR_SERVER_URL') as string,
    );
  }

  // TODO: add validation if server is not in testnet
  async createAccountWithFriendbot(): Promise<Keypair> {
    const keypair = StellarSdk.Keypair.random();
    await this.server.friendbot(keypair.publicKey()).call();
    return {
      publicKey: keypair.publicKey(),
      secret: keypair.secret(),
    };
  }

  async loadAccount(publicKey: string): Promise<Account> {
    const account = await this.server.loadAccount(publicKey);
    return {
      publicKey,
      sequence: account.sequence,
    };
  }
}
