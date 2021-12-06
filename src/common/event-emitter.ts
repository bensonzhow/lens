/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * The options for when adding a new listener
 */
export interface AddListenerOptions {
  /**
   * Should the listener only ever receive one event.
   *
   * @default false
   */
  once?: boolean;

  /**
   * If `true` then the listener will be put to the front of the event queue
   *
   * @default false
   */
  prepend?: boolean;
}

/**
 * A function for handling events. If the function returns `false` then no
 * further listeners will be called for that event.
 */
export type EventListener<D extends any[]> = (...data: D) => void | boolean;

/**
 * An event emitter for a single event. Generic over the arguments for the
 * event handler.
 */
export class EventEmitter<D extends any[]> {
  protected listeners = new Map<EventListener<D>, Required<Omit<AddListenerOptions, "prepend">>>();

  /**
   * Add a new listener for this event emitter
   * @param callback The function to call when an event is emitted.
   * @param options Options for controlling how the listener is handled.
   */
  addListener(callback: EventListener<D>, options?: AddListenerOptions) {
    const { prepend, once = false } = options ?? {};

    if (prepend) {
      this.listeners = new Map([
        [callback, { once }],
        ...this.listeners.entries(),
      ]);
    } else {
      this.listeners.set(callback, { once });
    }
  }

  /**
   * Removes `callback` from being called for future events.
   * @param callback The listener instance to remove
   */
  removeListener(callback: EventListener<D>) {
    this.listeners.delete(callback);
  }

  /**
   * Removes all current listeners.
   */
  removeAllListeners() {
    this.listeners.clear();
  }

  /**
   * Emits a new event.
   * @param data The event data
   */
  emit(...data: D) {
    for (const [callback, { once }] of this.listeners) {
      if (once) {
        this.removeListener(callback);
      }

      if (callback(...data) === false) {
        break;
      }
    }
  }
}
