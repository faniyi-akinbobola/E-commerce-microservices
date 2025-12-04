import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OrderService {

  constructor(
        @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy
    
  ) {}

  getHello(): string {
    return 'Hello World!';
  }
}
