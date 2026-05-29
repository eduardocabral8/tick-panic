import { PrismaClient } from '@prisma/client';
import { CategoryRepository, Category } from '@tick-panic/domain';

export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async save(category: Category): Promise<void> {
    await this.prisma.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        examples: category.examples,
      },
      create: {
        id: category.id,
        name: category.name,
        examples: category.examples,
      },
    });
  }

  async findAll(): Promise<Category[]> {
    const dbCategories = await this.prisma.category.findMany();
    return dbCategories.map((dbCat: { id: string; name: string; examples: string[] }) => {
      const category = Object.create(Category.prototype);
      Object.assign(category, {
        id: dbCat.id,
        name: dbCat.name,
        examples: dbCat.examples,
      });
      return category;
    });
  }

  async findById(id: string): Promise<Category | null> {
    const dbCat = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!dbCat) {
      return null;
    }
    const category = Object.create(Category.prototype);
    Object.assign(category, {
      id: dbCat.id,
      name: dbCat.name,
      examples: dbCat.examples,
    });
    return category;
  }
}
