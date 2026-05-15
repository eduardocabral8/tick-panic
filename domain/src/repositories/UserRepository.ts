import { User } from '../entities/User.js';

export interface UserRepository {
  save(user: User): void;
  findById(id: string): User | null;
  findByUsername(username: string): User | null;
  findAll(): User[];
}
