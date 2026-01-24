import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const jwksUri = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: jwksUri,
      }),
      algorithms: ['ES256'],
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
