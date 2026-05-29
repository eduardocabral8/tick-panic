import jwt from 'jsonwebtoken';
import { TokenGeneratorPort } from '@tick-panic/domain';

export class JwtTokenGenerator implements TokenGeneratorPort {
  constructor(private secret: string) {}

  async generate(payload: Record<string, unknown>): Promise<string> {
    return jwt.sign(payload, this.secret, { expiresIn: '7d' });
  }

  async verify(token: string): Promise<Record<string, unknown>> {
    return jwt.verify(token, this.secret) as Record<string, unknown>;
  }
}
