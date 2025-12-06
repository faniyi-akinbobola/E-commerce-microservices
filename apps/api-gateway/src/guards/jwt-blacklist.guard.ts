import { Injectable, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtBlacklistGuard extends AuthGuard('jwt') {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, validate the JWT token using passport
    const isValid = await super.canActivate(context);
    if (!isValid) {
      return false;
    }

    // Extract the token from the request
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.replace('Bearer ', '');

    // Check if token is blacklisted via RabbitMQ
    try {
      const result = await firstValueFrom(
        this.authClient.send({ cmd: 'check_blacklist' }, { token })
      );
      
      if (result.isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // If the check fails for other reasons, log but allow (fail open for availability)
      console.error('Blacklist check failed:', error);
    }

    // Check if user still exists in database
    try {
      const userId = request.user?.id;
      if (userId) {
        const userCheck = await firstValueFrom(
          this.authClient.send({ cmd: 'check_user_exists' }, { userId })
        );
        
        if (!userCheck.exists) {
          throw new UnauthorizedException('User no longer exists');
        }
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('User existence check failed:', error);
    }

    return true;
  }
}
