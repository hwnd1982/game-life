export abstract class EventEmiter {
  #events: { [key: string]: (...args: any) => any } = {}

  on(event: string, callback: (...args: any) => any): this {
    this.#events = {
      ...this.#events, [`${event}`]: callback
    };

    return this;
  }

  emit(event: string, ...args: any) {
    if (event in this.#events) {
      this.#events[event](event, ...args);
    }
  }

  get events() {
    return Object.keys(this.#events);
  };
}
