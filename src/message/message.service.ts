import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StellarService } from 'src/stellar/stellar.service';
import { Message } from './message.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { MessageListedMapper } from './mapper/message-listed.mapper';
import { MessageListedDto } from './dto/message-listed.dto';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly stellarService: StellarService,
    private readonly userService: UserService,
    private readonly messageListedMapper: MessageListedMapper
  ) {}

  private async findMessageById(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['fromAccount', 'toAccount'],
    });

    if (!message) {
      const errorMessage = `Message with id ${id} not found`;
      this.logger.error(errorMessage);
      throw new NotFoundException(errorMessage);
    }

    return message;
  }

  
  async getMessagesByUser(publicKey: string, messageType: 'all' | 'sent' | 'received' = 'all'): Promise<MessageListedDto[]> {
    const user = await this.userService.loadOrCreate(publicKey);

    let conditions: FindOptionsWhere<Message> | FindOptionsWhere<Message>[] | undefined    = [];
    if (messageType === 'all' || messageType === 'sent') {
      conditions.push({ fromAccount: { id: user.id } });
    }
    if (messageType === 'all' || messageType === 'received') {
      conditions.push({ toAccount: { id: user.id } });
    }

    const messages = await this.messageRepository.find({
      where: conditions,
      order: { createdAt: 'DESC' },
      select: ['id', 'amount', 'status', 'createdAt'],
      relations: ['fromAccount', 'toAccount']
    })
    
    return messages.map((message) => this.messageListedMapper.fromMessageToMessageListed(message));
  }

  async createPendingMessage(
    fromPublicKey: string,
    toPublicKey: string,
    amount: string,
    message: string,
  ): Promise<Message> {
    const fromAccount = await this.userService.loadOrCreate(fromPublicKey);
    const toAccount = await this.userService.loadOrCreate(toPublicKey);

    const { escrowPublicKey, transactionXdr } =
      await this.stellarService.createEscrowAccount(
        fromPublicKey,
        toPublicKey,
        amount,
      );

    const newMessage = new Message();
    newMessage.fromAccount = fromAccount;
    newMessage.toAccount = toAccount;
    newMessage.escrowAccount = escrowPublicKey;
    newMessage.message = message;
    newMessage.amount = amount;
    newMessage.createEscrowTransactionXdr = transactionXdr;
    newMessage.status = 'PENDING';
    newMessage.isTransactionSubmissionPending = true;

    return await this.messageRepository.save(newMessage);
  }

  async submitMessageTransaction(
    messageId: number,
    transactionXdr: string,
  ): Promise<void> {
    const message = await this.findMessageById(messageId);
    message.isTransactionSubmissionPending = false;

    await this.messageRepository.save(message);
    await this.stellarService.submitTransaction(transactionXdr);
  }

  async cancelMessage(messageId: number): Promise<Message> {
    const message = await this.findMessageById(messageId);

    const transactionXdr = await this.stellarService.payWithEscrow(
      message.escrowAccount,
      message.amount,
      message.fromAccount.publicKey,
    );

    message.cancelPaymentTransactionXdr = transactionXdr;
    message.status = 'CANCELED';
    message.isTransactionSubmissionPending = true;

    return await this.messageRepository.save(message);
  }

  async receiveMessage(messageId: number): Promise<Message> {
    const message = await this.findMessageById(messageId);

    const transactionXdr = await this.stellarService.payWithEscrow(
      message.escrowAccount,
      message.amount,
      message.toAccount.publicKey,
    );

    message.receivePaymentTransactionXdr = transactionXdr;
    message.status = 'RECEIVED';
    message.isTransactionSubmissionPending = true;

    return await this.messageRepository.save(message);
  }
}
