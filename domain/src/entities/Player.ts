export type PlayerRole = 'host' | 'player';

export class Player {
  readonly id: string;
  readonly name: string;
  readonly role: PlayerRole;
  readonly joinedAt: Date;

  constructor(name: string, role: PlayerRole, now: Date) {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new Error('Player name is required');
    }
    if (trimmed.length > 50) {
      throw new Error('Player name must be 50 characters or less');
    }
    if (role !== 'host' && role !== 'player') {
      throw new Error('Role must be host or player');
    }

    this.id = crypto.randomUUID();
    this.name = trimmed;
    this.role = role;
    this.joinedAt = now;
  }
}
