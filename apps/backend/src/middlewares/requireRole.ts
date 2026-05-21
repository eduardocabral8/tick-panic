import { FastifyReply, FastifyRequest } from 'fastify';

export function requireRole(role: string) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user || request.user.role !== role) {
      reply.status(403).send({ error: 'Forbidden' });
      return;
    }
  };
}
