import test from "node:test";
import assert from "node:assert/strict";
import { AutoPartService } from "../src/services/index.js";
import { EntityStatus } from "../src/types/index.js";

function createServiceWithPart(): { service: AutoPartService; id: string } {
  const service = new AutoPartService();
  const item = service.create({
    title: "Фільтр оливи",
    price: 450,
    vinCompatibility: ["VIN00000000000001"],
    oemCode: "FILTER-001",
    condition: "new",
    status: EntityStatus.Active
  });
  return { service, id: item.id };
}

test("створює сутність з автоматичним ID та датами", () => {
  const { service, id } = createServiceWithPart();
  const item = service.findById(id);
  assert.ok(item);
  assert.equal(item.id, id);
  assert.ok(item.createdAt instanceof Date);
  assert.ok(item.updatedAt instanceof Date);
});

test("відхиляє порожню назву", () => {
  const service = new AutoPartService();
  assert.throws(() => service.create({
    title: " ",
    price: 100,
    vinCompatibility: ["VIN1"],
    oemCode: "OEM1",
    condition: "new",
    status: EntityStatus.Active
  }));
});

test("відхиляє від'ємну ціну", () => {
  const service = new AutoPartService();
  assert.throws(() => service.create({
    title: "Деталь",
    price: -1,
    vinCompatibility: ["VIN1"],
    oemCode: "OEM1",
    condition: "new",
    status: EntityStatus.Active
  }));
});

test("відхиляє порожній OEM-код", () => {
  const service = new AutoPartService();
  assert.throws(() => service.create({
    title: "Деталь",
    price: 100,
    vinCompatibility: ["VIN1"],
    oemCode: " ",
    condition: "new",
    status: EntityStatus.Active
  }));
});

test("знаходить сутність за ID", () => {
  const { service, id } = createServiceWithPart();
  assert.equal(service.findById(id)?.title, "Фільтр оливи");
});

test("повертає null для невідомого ID", () => {
  const { service } = createServiceWithPart();
  assert.equal(service.findById("unknown"), null);
});

test("повертає всі сутності", () => {
  const { service } = createServiceWithPart();
  assert.equal(service.findAll().length, 1);
});

test("частково оновлює сутність та зберігає системні поля", () => {
  const { service, id } = createServiceWithPart();
  const before = service.findById(id);
  assert.ok(before);
  const after = service.update(id, { price: 500 });
  assert.ok(after);
  assert.equal(after.price, 500);
  assert.equal(after.id, before.id);
  assert.equal(after.createdAt.getTime(), before.createdAt.getTime());
  assert.ok(after.updatedAt.getTime() >= before.updatedAt.getTime());
});

test("не змінює початковий об'єкт після оновлення", () => {
  const { service, id } = createServiceWithPart();
  const before = service.findById(id);
  assert.ok(before);
  service.update(id, { title: "Новий фільтр" });
  assert.equal(before.title, "Фільтр оливи");
});

test("повертає коротке представлення сутності", () => {
  const { service, id } = createServiceWithPart();
  const item = service.findById(id);
  assert.ok(item);
  assert.deepEqual(service.summarize(item), {
    id: item.id,
    title: item.title,
    price: item.price
  });
});

test("рахує всі статуси, включно з нульовими", () => {
  const { service } = createServiceWithPart();
  assert.deepEqual(service.getAnalytics(), {
    ACTIVE: 1,
    ARCHIVED: 0,
    DRAFT: 0
  });
});

test("видаляє сутність та повертає false при повторному видаленні", () => {
  const { service, id } = createServiceWithPart();
  assert.equal(service.deleteById(id), true);
  assert.equal(service.findById(id), null);
  assert.equal(service.deleteById(id), false);
});

test("формує стандартизовану API-відповідь", () => {
  const { service, id } = createServiceWithPart();
  const item = service.findById(id);
  assert.ok(item);
  const response = service.createResponse(item);
  assert.equal(response.success, true);
  assert.equal(response.data.id, id);
  assert.ok(response.timestamp instanceof Date);
  assert.equal(response.meta?.totalCount, 1);
});
