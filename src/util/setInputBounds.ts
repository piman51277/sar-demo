/**
 * Sets the min, max, and step attributes of a number input element.
 * @param {string} id The id of the number input element.
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @param {number} step The step value.
 */
export function setInputBounds(
  id: string,
  min: number,
  max: number,
  step: number
): void {
  const input = document.getElementById(id) as HTMLInputElement;
  input.min = min.toString();
  input.max = max.toString();
  input.step = step.toString();

  //bind an event that listens for change
  input.addEventListener("change", () => {
    //if the value is less than the minimum, set it to the minimum
    if (Number(input.value) < min) {
      input.value = min.toString();
    }
    //if the value is greater than the maximum, set it to the maximum
    if (Number(input.value) > max) {
      input.value = max.toString();
    }

    //round the value to the nearest step
    input.value = (Math.round(Number(input.value) / step) * step).toString();
  });
}
