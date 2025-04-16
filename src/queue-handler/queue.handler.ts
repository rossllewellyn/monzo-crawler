export class QueueHandler {
  private _queue: string[];

  // TODO: validate input
  constructor(initialState: string[] = []) {
    this._queue = [...initialState];
  }

  get copy() {
    return [...this._queue];
  }
  get count() {
    return this._queue.length;
  }

  public push(message: string) {
    this._queue.push(message);
  }
  public shift() {
    return this._queue.shift();
  }
}
