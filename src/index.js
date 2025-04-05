export class Emitter {
	#value = null;
	#subscriptions = new Set();

	constructor(initialValue) {
		if (typeof initialValue !== "undefined") this.#value = initialValue;
	}

	get value() {
		return this.#value;
	}

	next(data) {
		typeof data === "function" ? data(this.#value) : (this.#value = data);

		this.#subscriptions.forEach(({ until }) => until && until());
		this.#subscriptions.forEach(({ cb }) => cb(this.#value));
	}
	subscribe(cb, options = { lazy: true }) {
		const listener = { cb };
		this.#subscriptions.add(listener);
		if (!options.lazy) cb(this.#value);

		const subscription = {
			unsubscribe: () => this.#subscriptions.delete(listener),
			until: (condition) => {
				listener.until = () =>
					condition(this.#value) ? subscription.unsubscribe() : null;
			},
			trigger: (message) => cb(message),
		};

		return subscription;
	}
}

export class ComputedEmitter {
	#internalEmitter = null;
	#dependencies = null;

	constructor(cb, dependencies) {
		this.#dependencies = new Set(dependencies);
		this.#internalEmitter = new Emitter(cb());

		this.#dependencies.forEach((dep) => {
			dep.subscribe(() => this.#internalEmitter.next(cb()));
		});
	}

	get value() {
		return this.#internalEmitter.value;
	}

	subscribe = (cb, options = { lazy: true }) => {
		return this.#internalEmitter.subscribe(cb, options);
	};
}
