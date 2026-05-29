import { AnswerRepository, Answer } from '@tick-panic/domain';

export class InMemoryAnswerRepository implements AnswerRepository {
  private answers = new Map<string, Answer>();

  save(answer: Answer): void {
    this.answers.set(answer.id, answer);
  }

  findById(id: string): Answer | null {
    return this.answers.get(id) ?? null;
  }

  findAll(): Answer[] {
    return Array.from(this.answers.values());
  }
}
