import { BaseEntity } from "../types/base-entity.js";
import { IRepository } from "./irepository.js";
import { UpdateDto } from "../types/dto.js";

export class InMemoryRepository<T extends BaseEntity> implements IRepository<T> {
  protected readonly items = new Map<string, T>();

  create(item: T): T {
    if (!item.id.trim()) {
      throw new Error("Ідентифікатор не може бути порожнім");
    }

    if (this.items.has(item.id)) {
      throw new Error(`Сутність з ID ${item.id} вже існує`);
    }

    const storedItem = structuredClone(item);
    this.items.set(storedItem.id, storedItem);
    return structuredClone(storedItem);
  }

  findById(id: string): T | null {
    const item = this.items.get(id);
    return item ? structuredClone(item) : null;
  }

  findAll(): T[] {
    return Array.from(this.items.values(), item => structuredClone(item));
  }

  update(id: string, patch: UpdateDto<T>): T | null {
    const current = this.items.get(id);

    if (!current) {
      return null;
    }

    const safePatch = { ...patch } as Record<string, unknown>;
    delete safePatch.id;
    delete safePatch.createdAt;
    delete safePatch.updatedAt;

    const updated = {
      ...current,
      ...safePatch,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date()
    } as T;

    this.items.set(id, structuredClone(updated));
    return structuredClone(updated);
  }

  deleteById(id: string): boolean {
    return this.items.delete(id);
  }
}
