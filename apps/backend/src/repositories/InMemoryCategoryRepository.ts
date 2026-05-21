import { CategoryRepository, Category } from '@15-seconds/domain';

export class InMemoryCategoryRepository implements CategoryRepository {
  private categories = new Map<string, Category>();

  save(category: Category): void {
    this.categories.set(category.id, category);
  }

  findAll(): Category[] {
    return Array.from(this.categories.values());
  }

  findById(id: string): Category | null {
    return this.categories.get(id) ?? null;
  }
}
