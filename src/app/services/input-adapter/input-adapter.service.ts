import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GbaInput, keyboardInputToGbaInput } from './inputs';

@Injectable({
  providedIn: 'root'
})
export class InputAdapterService {
  inputSubject: Subject<GbaInput>;
  inputPromises: Map<string, Promise<void>> = new Map();
  inputResolves: Map<string, (value?: undefined) => void> = new Map();

  constructor() {
    this.inputSubject = new Subject<GbaInput>();
    this.initializePromises();
  }

  pressKey(event: KeyboardEvent): void {
    const gbaInput = keyboardInputToGbaInput(event.code);
    if (gbaInput === undefined) return;

    this.inputSubject.next(gbaInput);

    this.resolveInputPromise(gbaInput);
    this.resetPromise(gbaInput);
  }

  async waitForInput(input: GbaInput): Promise<void> {
    const promise = this.inputPromises.get(input.toString());
    if (!promise) return undefined;

    return promise;
  }

  private initializePromises(): void {
    const promises = new Map();
    for (let input of Object.values(GbaInput)) {
      promises.set(input.toString(), this.resetPromise(input as GbaInput));
    }
  }

  private resetPromise(input: GbaInput): void {
    const promise: Promise<undefined> = new Promise((resolve) => {
      this.inputResolves.set(input.toString(), resolve);
    });
    this.inputPromises.set(input.toString(), promise);
  }

  private resolveInputPromise(input: GbaInput): void {
    const resolve = this.inputResolves.get(input.toString());
    if (!resolve) return;

    resolve();
  }
}
