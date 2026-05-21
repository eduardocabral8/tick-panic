import { AuthService } from '../services/AuthService.js';

export async function loginUser(username: string, password: string, authService: AuthService): Promise<string> {
  return authService.login(username, password);
}
