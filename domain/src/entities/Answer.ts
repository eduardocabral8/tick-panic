export class Answer {
  readonly id: string;
  readonly turnId: string;
  readonly text: string;
  readonly submittedAt: Date;
  private _isValid: boolean | null = null;
  private _validatedAt: Date | null = null;

  constructor(turnId: string, text: string, submittedAt: Date) {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      throw new Error('Answer text is required');
    }
    this.id = crypto.randomUUID();
    this.turnId = turnId;
    this.text = trimmed;
    this.submittedAt = submittedAt;
  }

  get isValid(): boolean | null {
    return this._isValid;
  }

  get validatedAt(): Date | null {
    return this._validatedAt;
  }

  validate(valid: boolean, validatedAt: Date): void {
    if (this._isValid !== null) {
      throw new Error('Answer has already been validated');
    }
    this._isValid = valid;
    this._validatedAt = validatedAt;
  }
}
