import { Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { ApiOperation } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @ApiOperation({
    summary: 'Load or create user based on the Stellar public key.',
  })
  @Post('load-or-create/:publicKey')
  loadOrCreate(@Param('publicKey') publicKey: string): Promise<User | null> {
    return this.userService.loadOrCreate(publicKey);
  }
}
