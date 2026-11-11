import { BaseEntity } from "../types/base-entity.js";
import { UpdateDto } from "../types/dto.js";

export interface IRepository<T extends BaseEntity> {
  create(item: T): T;
  findById(id: string): T | null;
  findAll(): T[];
  update(id: string, patch: UpdateDto<T>): T | null;
  deleteById(id: string): boolean;
}
