import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as StellarSdk from '@stellar/stellar-sdk';
import { Account, Keypair } from 'src/@types/stellar';

@Injectable()
export class StellarService {
  private readonly logger = new Logger(StellarService.name);
  private readonly server: StellarSdk.Horizon.Server;
  private readonly networkPassphrase: string;
  private readonly escrowManagerKeypair: StellarSdk.Keypair;

  constructor(private readonly configService: ConfigService) {
    this.server = new StellarSdk.Horizon.Server(
      this.configService.get('STELLAR_SERVER_URL') as string,
    );

    this.escrowManagerKeypair = StellarSdk.Keypair.fromSecret(
      this.configService.get('STELLAR_ESCROW_MANAGER_SECRET') as string,
    );

    this.networkPassphrase = this.configService.get(
      'STELLAR_NETWORK_PASSPHRASE',
    ) as string;
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
    try {
      const account = await this.server.loadAccount(publicKey);
      return {
        publicKey,
        sequence: account.sequence,
      };
    } catch (error) {
      const errorMessage = `Account ${publicKey} not found in Stellar`;
      this.logger.error(errorMessage, error);
      throw new NotFoundException(errorMessage);
    }
  }

  async submitTransaction(transactionXdr: string): Promise<string> {
    try {
      const transaction = new StellarSdk.Transaction(
        transactionXdr,
        this.networkPassphrase,
      );
      const response = await this.server.submitTransaction(transaction);
      return response.hash;
    } catch (error) {
      const errorMessage = `Failed to submit transaction to Stellar`;
      this.logger.error(errorMessage, error);
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async createEscrowAccount(
    fromPublicKey: string,
    toPublicKey: string,
    amount: string,
  ): Promise<{ escrowPublicKey: string; transactionXdr: string }> {
    try {
      const fromAccount = await this.server.loadAccount(fromPublicKey);
      await this.server.loadAccount(toPublicKey);

      const escrowKeypair = StellarSdk.Keypair.random();

      const transaction = new StellarSdk.TransactionBuilder(fromAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          StellarSdk.Operation.createAccount({
            source: this.escrowManagerKeypair.publicKey(),
            destination: escrowKeypair.publicKey(),
            startingBalance: '3.0000000',
          }),
        )
        .addOperation(
          StellarSdk.Operation.setOptions({
            source: escrowKeypair.publicKey(),
            signer: {
              ed25519PublicKey: fromPublicKey,
              weight: 1,
            },
          }),
        )
        .addOperation(
          StellarSdk.Operation.setOptions({
            source: escrowKeypair.publicKey(),
            signer: {
              ed25519PublicKey: toPublicKey,
              weight: 1,
            },
          }),
        )
        .addOperation(
          StellarSdk.Operation.setOptions({
            source: escrowKeypair.publicKey(),
            masterWeight: 0,
            lowThreshold: 3,
            medThreshold: 3,
            highThreshold: 3,
            signer: {
              ed25519PublicKey: this.escrowManagerKeypair.publicKey(),
              weight: 2,
            },
          }),
        )
        .addOperation(
          StellarSdk.Operation.payment({
            source: fromPublicKey,
            destination: escrowKeypair.publicKey(),
            asset: StellarSdk.Asset.native(),
            amount,
          }),
        )
        .addMemo(StellarSdk.Memo.text('InboxCoin: escrow creation'))
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      transaction.sign(escrowKeypair, this.escrowManagerKeypair);

      return {
        escrowPublicKey: escrowKeypair.publicKey(),
        transactionXdr: transaction.toEnvelope().toXDR('base64'),
      };
    } catch (error) {
      const errorMessage = `Failed to create escrow account in Stellar`;
      this.logger.error(errorMessage, error);
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async payWithEscrow(
    escrowPublicKey: string,
    amount: string,
    destination: string,
  ): Promise<string> {
    try {
      const account = await this.server.loadAccount(destination);
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            source: escrowPublicKey,
            destination,
            asset: StellarSdk.Asset.native(),
            amount,
          }),
        )
        .addOperation(
          StellarSdk.Operation.accountMerge({
            source: escrowPublicKey,
            destination: this.escrowManagerKeypair.publicKey(),
          }),
        )
        .addMemo(StellarSdk.Memo.text('InboxCoin: escrow payment'))
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      transaction.sign(this.escrowManagerKeypair);

      return transaction.toEnvelope().toXDR('base64');
    } catch (error) {
      const errorMessage = `Failed to pay with escrow account in Stellar`;
      this.logger.error(errorMessage, error);
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
