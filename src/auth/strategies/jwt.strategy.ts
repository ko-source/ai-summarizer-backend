import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(payload: { sub: number; email: string }): Promise<{
    id: number;
    email: string;
  }> {
    const userId: number = payload.sub;
    const userResult: unknown = await this.usersService.findById(userId);
    if (!userResult) {
      throw new UnauthorizedException();
    }
    const user = userResult as { id: number; email: string };
    return { id: user.id, email: user.email };
  }
}
