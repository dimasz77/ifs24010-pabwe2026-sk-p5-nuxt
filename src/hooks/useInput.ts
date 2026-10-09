import { ref, type Ref } from "vue";

export type InputChange = Event | string;
export type UseInputResult = [Ref<string>, (event: InputChange) => void, (value: string) => void];

export default function useInput(defaultValue = ""): UseInputResult {
  const value = ref<string>(defaultValue);

  function handleValueChange(event: InputChange): void {
    value.value = typeof event === "string" ? event : (event.target as HTMLInputElement).value;
  }

  function setValue(newValue: string): void {
    value.value = newValue;
  }

  return [value, handleValueChange, setValue];
}
