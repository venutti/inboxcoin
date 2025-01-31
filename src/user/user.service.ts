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
      this.logger.error(`Account ${publicKey} not found in Stellar`, error);
    }

    const user = await this.usersRepository.findOne({
      where: { publicKey },
      relations: ['messagesSent', 'messagesReceived'],
    });

    if (user) {
      return user;
    }

    this.logger.log(`User ${publicKey} not found, creating...`);

    const newUser = new User();
    newUser.publicKey = publicKey;
    const savedUser = await this.usersRepository.save(newUser);
    return {
      ...savedUser,
      messagesSent: [],
      messagesReceived: [],
    };
  }
}
