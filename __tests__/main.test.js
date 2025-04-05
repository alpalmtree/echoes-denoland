import { expect } from "vitest";
import { Emitter, ComputedEmitter } from "../src";

describe("Emitter", () => {
  it("should accept an initial value", () => {
    const emitter = new Emitter(0);
    expect(emitter.value).toBe(0);
  });

  it("should have a subscribe method", () => {
    const emitter = new Emitter();
    expect(emitter.subscribe).toBeDefined();
  });

  it("should have a next method", () => {
    const emitter = new Emitter();
    expect(emitter.next).toBeDefined();
  });

  it("should work with any kind of value", () => {
    const emitter = new Emitter([1, 2]);
    let logs = [];
    emitter.subscribe((val) => (logs = val));
    emitter.next((val) => val.push(3));
    expect(logs).toEqual([1, 2, 3]);
  });

  it("should run as soon as declared if lazy is set to false", () => {
    const emitter = new Emitter(0);
    let count = 0;
    emitter.subscribe(() => count++, { lazy: false });
    expect(count).toBe(1);
    emitter.next(1);
    expect(count).toBe(2);
  });
});

describe("ComputedEmitter", () => {
  it("should accept a callback and dependencies", () => {
    const emitter = new ComputedEmitter(() => 0, []);
    expect(emitter.value).toBe(0);
  });

  it("should have a subscribe method", () => {
    const emitter = new ComputedEmitter(() => 0, []);
    expect(emitter.subscribe).toBeDefined();
  });

  it("should have a value getter", () => {
    const emitter = new ComputedEmitter(() => 0, []);
    expect(emitter.value).toBeDefined();
  });

  it("should not have a next method", () => {
    const emitter = new ComputedEmitter(() => 0, []);
    expect(emitter.next).toBeUndefined();
  });

  it("should update when a dependency changes", () => {
    const $count = new Emitter(0);
    const $double = new ComputedEmitter(() => $count.value * 2, [$count]);
    expect($double.value).toBe(0);

    $count.next(1);
    expect($double.value).toBe(2);
  });
});

describe("Subscription", () => {
  it("should clear the subscription", () => {
    const emitter = new Emitter(0);
    let count = 0;
    const listener = emitter.subscribe(() => count++);
    emitter.next(1);
    listener.unsubscribe();
    emitter.next(2);
    expect(count).toBe(1);
  });

  it("should clear the subscription with the until method", () => {
    const emitter = new Emitter(0);
    let count = 0;
    const listener = emitter.subscribe(() => count++);
    listener.until((val) => val > 2);

    emitter.next(1);
    emitter.next(4);
    expect(count).toBe(1);
  });

  it("should trigger a callback", () => {
    const emitter = new Emitter(0);
    let count = 0;
    const listener = emitter.subscribe(() => count++);
    listener.trigger();
    expect(count).toBe(1);
  });

  it("should trigger a callback with a message without modifying the original value", () => {
    const emitter = new Emitter();
    let message = "Whatever";
    const listener = emitter.subscribe((val) => (message = val));
    listener.trigger("Hello world!");
    expect(message).toBe("Hello world!");
    expect(emitter.value).toBe(null);
  });
});
