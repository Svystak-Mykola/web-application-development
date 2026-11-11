import { randomUUID } from "node:crypto";
import {
  ApiResponse,
  AutoPartEntity,
  CreateDto,
  EntityAnalytics,
  EntityStatus,
  EntitySummary,
  UpdateDto
} from "../types/index.js";
import { InMemoryRepository } from "../repositories/index.js";

export class AutoPartService {
  private readonly repository = new InMemoryRepository<AutoPartEntity>();

  create(data: CreateDto<AutoPartEntity>): AutoPartEntity {
    this.validate(data);

    const now = new Date();
    const entity: AutoPartEntity = {
      ...structuredClone(data),
      id: randomUUID(),
      createdAt: now,
      updatedAt: now
    };

    return this.repository.create(entity);
  }

  findById(id: string): AutoPartEntity | null {
    return this.repository.findById(id);
  }

  findAll(): AutoPartEntity[] {
    return this.repository.findAll();
  }

  update(id: string, patch: UpdateDto<AutoPartEntity>): AutoPartEntity | null {
    if (patch.price !== undefined && (!Number.isFinite(patch.price) || patch.price < 0)) {
      throw new Error("Ціна має бути невід'ємним числом");
    }

    if (patch.title !== undefined && !patch.title.trim()) {
      throw new Error("Назва не може бути порожньою");
    }

    if (patch.oemCode !== undefined && !patch.oemCode.trim()) {
      throw new Error("OEM-код не може бути порожнім");
    }

    if (patch.vinCompatibility !== undefined && patch.vinCompatibility.some(vin => !vin.trim())) {
      throw new Error("VIN-сумісність містить порожнє значення");
    }

    return this.repository.update(id, patch);
  }

  deleteById(id: string): boolean {
    return this.repository.deleteById(id);
  }

  summarize(entity: AutoPartEntity): EntitySummary<AutoPartEntity> {
    return {
      id: entity.id,
      title: entity.title,
      price: entity.price
    };
  }

  getAnalytics(): EntityAnalytics<AutoPartEntity> {
    const analytics: EntityAnalytics<AutoPartEntity> = {
      [EntityStatus.Active]: 0,
      [EntityStatus.Archived]: 0,
      [EntityStatus.Draft]: 0
    };

    for (const item of this.repository.findAll()) {
      analytics[item.status] += 1;
    }

    return analytics;
  }

  createResponse(data: AutoPartEntity): ApiResponse<AutoPartEntity> {
    return {
      success: true,
      data,
      timestamp: new Date(),
      meta: {
        totalCount: this.repository.findAll().length,
        storage: "in-memory"
      }
    };
  }

  private validate(data: CreateDto<AutoPartEntity>): void {
    if (!data.title.trim()) {
      throw new Error("Назва автозапчастини не може бути порожньою");
    }

    if (!Number.isFinite(data.price) || data.price < 0) {
      throw new Error("Ціна має бути невід'ємним числом");
    }

    if (!data.oemCode.trim()) {
      throw new Error("OEM-код не може бути порожнім");
    }

    if (data.vinCompatibility.length === 0 || data.vinCompatibility.some(vin => !vin.trim())) {
      throw new Error("Потрібно вказати коректну VIN-сумісність");
    }
  }
}
