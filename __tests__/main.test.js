import { expect } from "vitest";
import { echo, computed } from "../src";

describe("Echo", () => {
  it("should accept an initial value", () => {
    const source = echo(0);
    expect(source.value).toBe(0);
  });

  it("should have a subscribe method", () => {
    const source = echo();
    expect(source.listen).toBeDefined();
  });

  it("should have a next method", () => {
    const source = echo();
    expect(source.next).toBeDefined();
  });

  it("should work with any kind of value", () => {
    const source = echo([1, 2]);
    let logs = [];
    source.listen((val) => (logs = val));
    source.next((val) => val.push(3));
    expect(logs).toEqual([1, 2, 3]);
  });

  it("should run as soon as declared only if lazy is set to true", () => {
    const source = echo(0);
    let count = 0;
    source.listen(() => count++, { lazy: true });
    expect(count).toBe(0);
    source.next(1);
    expect(count).toBe(1);
  });
});

describe("Computed", () => {
  it("should accept a callback and dependencies", () => {
    const source = computed(() => 0, []);
    expect(source.value).toBe(0);
  });

  it("should have a subscribe method", () => {
    const source = computed(() => 0, []);
    expect(source.listen).toBeDefined();
  });

  it("should have a value getter", () => {
    const source = computed(() => 0, []);
    expect(source.value).toBeDefined();
  });

  it("should not have a next method", () => {
    const source = computed(() => 0, []);
    expect(source.next).toBeUndefined();
  });

  it("should update when a dependency changes", () => {
    const $count = echo(0);
    const $double = computed(() => $count.value * 2, [$count]);
    expect($double.value).toBe(0);

    $count.next(1);
    expect($double.value).toBe(2);
  });

  it("should trigger the listeners when its value change", () => {
    const logs = [];
    const $count = echo(0);
    const $double = computed(() => $count.value * 2, [$count]);
    $double.listen((val) => logs.push(val));
    $count.next(1);
    expect($double.value).toBe(2);
  });
});

describe("Subscription", () => {
  it("should clear the subscription", () => {
    const source = echo();
    let count = 0;
    const listener = source.listen(() => count++);
    source.next();
    listener.mute();
    source.next();
    expect(count).toBe(2);
  });

  it("should clear the subscription with the until method", () => {
    const source = echo(0);
    let count = 0;
    const listener = source.listen(() => count++);
    listener.until((val) => val > 2);

    source.next(2);
    source.next(4);
    expect(count).toBe(2);
  });

  it("should trigger a callback", () => {
    const source = echo(0);
    let count = 0;
    const listener = source.listen(() => count++, { lazy: true });
    listener.trigger();
    expect(count).toBe(1);
  });

  it("should trigger a callback with a message without modifying the original value", () => {
    const source = echo();
    let message = "Whatever";
    const listener = source.listen((val) => (message = val));
    listener.trigger("Hello world!");
    expect(message).toBe("Hello world!");
    expect(source.value).toBe(null);
  });
});
