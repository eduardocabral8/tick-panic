import { FastifyReply, FastifyRequest } from 'fastify';

export async function errorHandler(error: Error, request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const message = error.message;

  if (message === 'Username already exists' || message === 'Game has already started' || message === 'Player already in game' || message === 'Answer has already been validated' || message === 'Player already has a turn in this round') {
    reply.status(409).send({ error: message });
    return;
  }

  if (message === 'Invalid credentials') {
    reply.status(403).send({ error: message });
    return;
  }

  if (message === 'Only the host can start the game' || message === 'Forbidden' || message === 'Cannot validate your own answer') {
    reply.status(403).send({ error: message });
    return;
  }

  if (message === 'Game not found' || message === 'Turn not found' || message === 'Round not found' || message === 'User not found' || message === 'Answer not found') {
    reply.status(404).send({ error: message });
    return;
  }

  if (message === 'Username is required' ||
      message === 'Username must be 50 characters or less' ||
      message === 'Password hash is required' ||
      message === 'Category name is required' ||
      message === 'Player name is required' ||
      message === 'Player name must be 50 characters or less' ||
      message === 'Answer text is required' ||
      message === 'At least 2 players are required' ||
      message === 'At least 3 categories are required' ||
      message === 'Cannot add players after game has started' ||
      message === 'Game is not in progress' ||
      message === 'No active round' ||
      message === 'No pending turns' ||
      message === 'Turn can only be started when pending' ||
      message === 'Turn can only be ended when active' ||
      message === 'Turn is not active' ||
      message === 'Turn has not been started' ||
      message === 'Time limit exceeded' ||
      message === 'Turn cannot be finished yet' ||
      message === 'Current round is not completed' ||
      message === 'Round number must be between 1 and 3' ||
      message === 'Role must be admin or player' ||
      message === 'Role must be host or player' ||
      message === 'Maximum answers reached for this turn') {
    reply.status(400).send({ error: message });
    return;
  }

  reply.status(500).send({ error: 'Internal server error' });
}
