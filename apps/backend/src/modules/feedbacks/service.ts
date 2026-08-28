import { ConflictError, NotFoundError, ValidationError } from "../../shared/errors.js";
import type {
  FeedbackFilters,
  FeedbackListResponse,
  FeedbackNoteRecord,
  FeedbackRecord,
  FeedbackRepository,
  FeedbackStatus
} from "./types.js";
import { FeedbackStatus as FeedbackStatusValues, MAX_NOTE_LENGTH } from "./types.js";

export class FeedbackService {
  constructor(private readonly repository: FeedbackRepository) {}

  async list(filters: FeedbackFilters): Promise<FeedbackListResponse> {
    const items = await this.repository.list(filters);

    let ratingSum = 0;
    let positive = 0;
    let critical = 0;

    for (const item of items) {
      ratingSum += item.rating;
      if (item.rating >= 4) positive += 1;
      if (item.rating <= 2) critical += 1;
    }

    return {
      items,
      total: items.length,
      metrics: {
        averageRating: items.length === 0 ? 0 : Math.round((ratingSum / items.length) * 10) / 10,
        positive,
        critical
      }
    };
  }

  async get(id: string): Promise<FeedbackRecord> {
    return this.requireFeedback(id);
  }

  async getNotes(id: string): Promise<FeedbackNoteRecord[]> {
    await this.requireFeedback(id);
    return this.repository.listNotes(id);
  }

  async addNote(id: string, description: string): Promise<FeedbackNoteRecord> {
    await this.requireFeedback(id);

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      throw new ValidationError("Descricao obrigatoria");
    }
    if (trimmedDescription.length > MAX_NOTE_LENGTH) {
      throw new ValidationError(`Anotacao deve ter no maximo ${MAX_NOTE_LENGTH} caracteres`);
    }

    return this.repository.createNote(id, trimmedDescription);
  }

  async changeStatus(id: string, status: FeedbackStatus): Promise<FeedbackRecord> {
    if (!Object.values(FeedbackStatusValues).includes(status)) {
      throw new ValidationError("Status invalido");
    }

    const feedback = await this.requireFeedback(id);

    if (status === FeedbackStatusValues.CONCLUIDO && feedback.rating <= 2) {
      const notesCount = await this.repository.countNotes(id);

      if (notesCount === 0) {
        throw new ConflictError(
          "Feedback critico precisa de pelo menos uma anotacao antes de concluir",
          "CRITICAL_FEEDBACK_REQUIRES_NOTE"
        );
      }
    }

    return this.repository.updateStatus(id, status);
  }

  private async requireFeedback(id: string): Promise<FeedbackRecord> {
    const feedback = await this.repository.findById(id);

    if (!feedback) {
      throw new NotFoundError("Feedback nao encontrado");
    }

    return feedback;
  }
}
