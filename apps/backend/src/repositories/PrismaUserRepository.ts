import { PrismaClient } from '@prisma/client';
import { UserRepository, User } from '@15-seconds/domain';

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        username: user.username,
        passwordHash: user.passwordHash,
        role: user.role,
      },
      create: {
        id: user.id,
        username: user.username,
        passwordHash: user.passwordHash,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!dbUser) {
      return null;
    }
    const user = Object.create(User.prototype);
    Object.assign(user, {
      id: dbUser.id,
      username: dbUser.username,
      passwordHash: dbUser.passwordHash,
      role: dbUser.role,
      createdAt: dbUser.createdAt,
    });
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    const dbUser = await this.prisma.user.findUnique({
      where: { username },
    });
    if (!dbUser) {
      return null;
    }
    const user = Object.create(User.prototype);
    Object.assign(user, {
      id: dbUser.id,
      username: dbUser.username,
      passwordHash: dbUser.passwordHash,
      role: dbUser.role,
      createdAt: dbUser.createdAt,
    });
    return user;
  }

  async findAll(): Promise<User[]> {
    const dbUsers = await this.prisma.user.findMany();
    return dbUsers.map((dbUser: { id: string; username: string; passwordHash: string; role: string; createdAt: Date }) => {
      const user = Object.create(User.prototype);
      Object.assign(user, {
        id: dbUser.id,
        username: dbUser.username,
        passwordHash: dbUser.passwordHash,
        role: dbUser.role,
        createdAt: dbUser.createdAt,
      });
      return user;
    });
  }
}
