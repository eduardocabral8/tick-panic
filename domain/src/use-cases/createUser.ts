import { User } from '../entities/User.js';
import { AuthService } from '../services/AuthService.js';

export async function createUser(username: string, password: string, role: 'admin' | 'player', now: Date, authService: AuthService): Promise<User> {
  return authService.register(username, password, role, now);
}
