export type UserRole = 'admin' | 'player';

export class User {
  readonly id: string;
  readonly username: string;
  readonly passwordHash: string;
  readonly role: UserRole;
  readonly createdAt: Date;

  constructor(username: string, passwordHash: string, role: UserRole) {
    const trimmed = username.trim();
    if (trimmed.length === 0) {
      throw new Error('Username is required');
    }
    if (trimmed.length > 50) {
      throw new Error('Username must be 50 characters or less');
    }
    if (passwordHash.length === 0) {
      throw new Error('Password hash is required');
    }
    if (role !== 'admin' && role !== 'player') {
      throw new Error('Role must be admin or player');
    }

    this.id = crypto.randomUUID();
    this.username = trimmed;
    this.passwordHash = passwordHash;
    this.role = role;
    this.createdAt = new Date();
  }
}
