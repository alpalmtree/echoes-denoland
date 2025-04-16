# Timberland - Emitters <!-- omit in toc -->
The `emitters` package is a very simple and straight-forward implementation of the [Observer Pattern](https://www.patterns.dev/vanilla/observer-pattern/). It also takes inspiration from several niceties found in [RxJs](https://github.com/ReactiveX/rxjs) and [Signals](https://github.com/preactjs/signals), such as:
- Explicit `subscribe` and  `unsubscribe` methods (RxJs)
- `until` method (RxJs)
- Computed reactive values (Signals)

Besides:
- Make **any value** reactive. It can be anything from a string to a WeakMap, implemented with no extra code
- Create events that are **not value dependent**. If you don't need your reactivity to be attached to any specific value, just use the Emitters for triggering events
- Less than **500b** minified + gzipped

## Project status <!-- omit in toc -->
This package is pretty new and we don't expect a crazy wild adoption. The API and the implementation are fairly simple, but please be aware that bugs might appear. If you find anything strange, please let us know by opening an issue.

Even though it's under active development, the API is stable and it's very unlikely to change. However, until we don't hit a v1, we cannot ensure that the API will remain intact. There are still a lot of work to do and we will try our best to not change the usage. But if a fix requires changing the API in order to keep the bundle size small, we should be open to minor adjustments.

- [Installation](#installation)
  - [With a package manager](#with-a-package-manager)
  - [With a CDN](#with-a-cdn)
- [Reference (API/Usage)](#reference-apiusage)
  - [`new Emitter(optionalInitialValue)`](#new-emitteroptionalinitialvalue)
    - [`Emitter.value`](#emittervalue)
    - [`Emitter#subscribe`](#emittersubscribe)
    - [`Emitter#next`](#emitternext)
  - [`new ComputedEmitter(callback, [dependencies])`](#new-computedemittercallback-dependencies)
  - [`Subscription`](#subscription)
    - [`Subscription#unsubscribe`](#subscriptionunsubscribe)
    - [`Subscription#until`](#subscriptionuntil)
    - [`Subscription#trigger(optionalMessage)`](#subscriptiontriggeroptionalmessage)
- [License](#license)

## Installation
### With a package manager
```bash
pnpm add @timberland/emitters
...
```

```javascript
import { Emitter, ComputedEmitter } from "@timberland/emitters"
```

### With a CDN
```html
<!-- ESM -->
<script type="module">
    import { Emitter, ComputedEmitter } from "https://unpkg.com/@timberland/emitters/dist/emitters.esm.js"
</script>

<!-- IIFE -->
<script src="https://unpkg.com/@timberland/emitters/dist/emitters.iife.js"></script>
<script>
    // Stored under the emitters global name so we don't pollute the global scope
    const { Emitter, ComputedEmitter } = window.emitters 
</script>
```
> [!CAUTION] 
> These examples should be used for development only. If you plan to use the CDN for production, pin a specific version. For instance: `https://unpkg.com/@timberland/emitters@0.0.4/dist/emitters.esm.js`. Check the releases section for getting the latest version.

## Reference (API/Usage)
### `new Emitter(optionalInitialValue)`
The `Emitter` constructor creates a new Emitter instance with an optional initial value:

```javascript
const $count = new Emitter(0)

const $map = new Emitter(new Map())

const $statelessEvent = new Emitter()
```

#### `Emitter.value`
This will return the current value of the Emitter (if any). Feel free to access it anywhere in your code, as it won't register or trigger any side effects:

```javascript
$count.value // -> 0

$map.value // -> Map instance

$statelessEvent.value // -> null
```

#### `Emitter#subscribe`
It accepts a callback that will be triggered whenever the `next` or `trigger` methods are invoked. The callback will receive the current value of the Emitter or any message provided with the `trigger` method.

```javascript
$count.subscribe((count) => console.log(count))

$map.subscribe((map) => console.log(map.get('awesomeKey')))

$statelessEvent.subscribe((optionalMessage) => console.log(optionalMessage ?? 'No message provided'))
```

Subscriptions are **lazy by default**, meaning that they will not run when first declared. If you need to run it as soon as declared, you can pass an object with the `lazy` property set as `false` as a second argument:

```javascript
$count.subscribe((count) => doSomething(), { lazy: false })
```

In any case, it will return a `Subscription` object. More on it later.

#### `Emitter#next`
This method will be responsible for mutating the value and triggering all subscriptions. You can either provide a new value directly or through a callback (recommended for complex datatypes):

```javascript
$count.next(2) // -> will set the value to 2 and trigger all subscriptions

$map.next((prev) => prev.set('hello', 'world')) // -> will mutate the value and then trigger the subscriptions

$statelessEvent.next('now we have value') // -> not recommended, but possible
```

### `new ComputedEmitter(callback, [dependencies])`
The `ComputedEmitter` constructor returns an Emitter-like object with only a `subscribe` method. Its value will be computed based on the callback's return value and the Emitters contained within the dependencies array:

```javascript
const $double = new ComputedEmitter(() => $count.value * 2, [ $count ])
```

Behind the scenes, it is creating an internal Emitter whose value is being updated every time the value of any of its dependencies change:

```javascript
$double.subscribe((value) => console.log(value))

$count.next(2) // -> will log 4
```

### `Subscription`
Any `subscribe` method will return a `Subscription` object that we can use to clear the subscription itself. The object is exactly the same in both `Emitter` and `ComputedEmitter`.

#### `Subscription#unsubscribe`
This will clear the subscription on-demand:

```javascript
const $count = new Emitter(0)
const subscription = $count.subscribe((value) => console.log(value))

$count.next( $count.value + 1 ) // -> will log 1
subscription.unsubscribe()
$count.next( $count.value + 1 ) // -> won't log anything
```

#### `Subscription#until`
Heavily inspired by the `takeUntil` method from RxJs. Useful when we want the subscription to take place only until a certain condition is met:

```javascript
const $count = new Emitter(0)
const subscription = $count.subscribe((value) => console.log(value))

subscription.until((value) => value > 2)

$count.next( $count.value + 1 ) // -> will log 1
$count.next( $count.value + 1 ) // -> will log 2
$count.next( $count.value + 1 ) // -> won't log anything
```

#### `Subscription#trigger(optionalMessage)`
This will trigger the callback without mutating the value of the Emitter. Useful for when we have a stateless Emitter. Optionally, it takes a message that will be passed on to the callback:

```javascript
const $onMessage = new Emitter()
const messageEvent = $onMessage.subscribe((msg) => console.log(msg ?? 'no message provided'))

messageEvent.trigger('Hello world') // will log 'Hello world'
messageEvent.trigger() // will log 'no message provided'
```

## License
MIT