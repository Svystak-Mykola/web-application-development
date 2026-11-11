import { BaseEntity } from "./base-entity.js";
import { EntityStatus } from "./entity-status.js";

export type AutoPartCondition = "new" | "refurbished";

export interface AutoPartEntity extends BaseEntity {
  title: string;
  price: number;
  vinCompatibility: string[];
  oemCode: string;
  condition: AutoPartCondition;
  status: EntityStatus;
}
