import { URL } from "url";
import { z } from "zod";

const seedUrlAssert = z.string().nonempty("expected non-empty").url("expected url");

export class DomainHandler {
  private _target: string;
  private _map: Map<string, Set<string>> = new Map();
  private _history: Set<string>;

  constructor(seedUrl: string) {
    try {
      seedUrlAssert.parse(seedUrl);
    } catch (error: any) {
      throw new Error(`domain handler invalid input: ${error?.message || error}`);
    }
    this._target = new URL(seedUrl).hostname;
    this._history = new Set([seedUrl]);
  }

  get target() {
    return this._target;
  }
  get map() {
    return this._map;
  }
  get history() {
    return this._history;
  }
}
