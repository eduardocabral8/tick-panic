import { CategoryRepository, Category } from '@15-seconds/domain';

export class InMemoryCategoryRepository implements CategoryRepository {
  private categories = new Map<string, Category>();

  async save(category: Category): Promise<void> {
    this.categories.set(category.id, category);
  }

  async findAll(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async findById(id: string): Promise<Category | null> {
    return this.categories.get(id) ?? null;
  }
}
