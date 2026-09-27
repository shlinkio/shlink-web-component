/**
 * A function that natively sets a new value on an input, in a way that's closer to how it would behave on a real human
 * interaction.
 * This also ensures React onInput and onChange event handlers are triggered as expected after the new value is set.
 *
 * This function is useful when testing date inputs, which implementation defers between browsers and locales, and are
 * hard to test using userEvent.fill() or userEvent.type()
 */
export function setNativeInputValue(element: HTMLInputElement, value: string) {
  // Set the value via the native setter, rather than `element.value = value`, otherwise React may not be aware of the
  // new value.
  // oxlint-disable-next-line typescript/unbound-method
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
  nativeSetter.call(element, value);

  // Dispatch input and change events for the input which value has been changed
  element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
}
