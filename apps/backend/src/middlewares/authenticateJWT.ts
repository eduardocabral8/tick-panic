import { FastifyReply, FastifyRequest } from 'fastify';
import { TokenGeneratorPort } from '@15-seconds/domain';

export async function authenticateJWT(request: FastifyRequest, reply: FastifyReply, tokenGenerator: TokenGeneratorPort): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.status(403).send({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = await tokenGenerator.verify(token);
    request.user = { userId: payload.userId as string, role: payload.role as string };
  } catch {
    reply.status(403).send({ error: 'Invalid token' });
    return;
  }
}
