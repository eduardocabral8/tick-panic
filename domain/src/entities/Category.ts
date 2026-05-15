export class Category {
  readonly id: string;
  readonly name: string;
  readonly examples: string[];

  constructor(name: string, examples: string[] = []) {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new Error('Category name is required');
    }
    this.id = crypto.randomUUID();
    this.name = trimmed;
    this.examples = examples;
  }
}
