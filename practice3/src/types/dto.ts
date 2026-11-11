import { BaseEntity } from "./base-entity.js";

export type CreateDto<T extends BaseEntity> = Omit<T, keyof BaseEntity>;
export type UpdateDto<T extends BaseEntity> = Partial<CreateDto<T>>;
export type EntitySummary<T extends BaseEntity & { title: string; price: number }> =
  Pick<T, "id" | "title" | "price">;
export type EntityAnalytics<T extends { status: string }> = Record<T["status"], number>;
