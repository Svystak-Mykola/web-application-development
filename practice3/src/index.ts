import { AutoPartService } from "./services/index.js";
import { ApiResponse, AutoPartEntity, EntityStatus } from "./types/index.js";

const service = new AutoPartService();

const parts = [
  service.create({
    title: "Гальмівні колодки Bosch",
    price: 1850,
    vinCompatibility: ["WVWZZZ1JZXW000001", "WVWZZZ1JZXW000002"],
    oemCode: "BOSCH-BP-001",
    condition: "new",
    status: EntityStatus.Active
  }),
  service.create({
    title: "Генератор Valeo",
    price: 6200,
    vinCompatibility: ["WVWZZZ3CZWE000003"],
    oemCode: "VALEO-ALT-220",
    condition: "refurbished",
    status: EntityStatus.Active
  }),
  service.create({
    title: "Амортизатор Sachs",
    price: 2750,
    vinCompatibility: ["WVWZZZ6RZDY000004"],
    oemCode: "SACHS-SHOCK-17",
    condition: "new",
    status: EntityStatus.Draft
  })
];

console.log("\n=== GENERIC IN-MEMORY REPOSITORY ===");
console.log("\n=== СТВОРЕНІ АВТОЗАПЧАСТИНИ ===");
console.table(parts.map(({ id, title, price, oemCode, condition, status }) => ({
  id,
  title,
  price,
  oemCode,
  condition,
  status
})));

const brakePads = parts[0]!;
const shockAbsorber = parts[2]!;

const found = service.findById(brakePads.id);
console.log("\n=== ПОШУК ЗА ID ===");
console.log(found);

const updated = service.update(brakePads.id, {
  price: 1690,
  status: EntityStatus.Active
});

console.log("\n=== ЧАСТКОВЕ ОНОВЛЕННЯ ===");
console.log({
  before: brakePads,
  after: updated,
  idPreserved: updated?.id === brakePads.id,
  createdAtPreserved: updated?.createdAt.getTime() === brakePads.createdAt.getTime()
});

console.log("\n=== УСІ СУТНОСТІ ===");
console.table(service.findAll().map(item => ({
  id: item.id,
  title: item.title,
  price: item.price,
  status: item.status
})));

console.log("\n=== ENTITY SUMMARY ===");
console.table(service.findAll().map(item => service.summarize(item)));

console.log("\n=== АНАЛІТИКА СТАТУСІВ ===");
console.log(JSON.stringify(service.getAnalytics(), null, 2));

const response: ApiResponse<AutoPartEntity> = service.createResponse(updated ?? brakePads);
console.log("\n=== API RESPONSE ===");
console.log(JSON.stringify(response, null, 2));

console.log("\n=== ВИДАЛЕННЯ ===");
const deleted = service.deleteById(shockAbsorber.id);
console.log({
  deleted,
  findAfterDelete: service.findById(shockAbsorber.id),
  remainingCount: service.findAll().length
});
