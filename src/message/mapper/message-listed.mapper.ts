import { Injectable } from "@nestjs/common";
import { Message } from "../message.entity";
import { MessageListedDto } from "../dto/message-listed.dto";

@Injectable()
export class MessageListedMapper {
  fromMessageToMessageListed = (message: Message): MessageListedDto => {
    const messageListedDto = new MessageListedDto();

    messageListedDto.id = message.id;
    messageListedDto.amount = message.amount;
    messageListedDto.fromAccount = message.fromAccount.publicKey;
    messageListedDto.toAccount = message.toAccount.publicKey;
    messageListedDto.status = message.status;
    messageListedDto.createdAt = message.createdAt;

    return messageListedDto;  
  };
}

