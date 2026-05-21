import { UserRepository, User } from '@15-seconds/domain';

export class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();

  save(user: User): void {
    this.users.set(user.id, user);
  }

  findById(id: string): User | null {
    return this.users.get(id) ?? null;
  }

  findByUsername(username: string): User | null {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }
}
