import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blacklist } from '../blacklist/blacklist.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @InjectRepository(Blacklist)
    private readonly blacklistRepository: Repository<Blacklist>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['authorization']?.replace('Bearer ', '');

    if (token) {
      const isBlacklisted = await this.blacklistRepository.findOne({ where: { token } });
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}