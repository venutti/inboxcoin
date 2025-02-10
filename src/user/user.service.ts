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
    return this.usersRepository.find({
      relations: ['messagesSent', 'messagesReceived'],
    });
  }

  async loadOrCreate(publicKey: string): Promise<User> {
    await this.stellarService.loadAccount(publicKey);

    const user = await this.usersRepository.findOne({
      where: { publicKey },
      relations: ['messagesSent', 'messagesSent.fromAccount', 'messagesSent.toAccount', 'messagesReceived', 'messagesReceived.fromAccount', 'messagesReceived.toAccount'],
    });

    if (user) {
      return user;
    }

    this.logger.debug(`User ${publicKey} not found in repository, creating...`);

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