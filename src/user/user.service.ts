import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { StellarService } from 'src/stellar/stellar.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly stellarService: StellarService,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async loadOrCreate(publicKey: string): Promise<User | null> {
    try {
      await this.stellarService.loadAccount(publicKey);
    } catch (error) {
      this.logger.error(
        `Error loading account ${publicKey} in the Stellar network`,
        error,
      );
    }

    // TODO: load or create when stellar account exists

    return this.usersRepository.findOne({ where: { publicKey } });
  }
}
