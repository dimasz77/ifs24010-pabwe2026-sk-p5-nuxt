import { describe, it, expect } from "vitest";
import useInput from "./useInput";

describe("useInput", () => {
  it("memakai nilai awal kosong secara bawaan", () => {
    const [value] = useInput();
    expect(value.value).toBe("");
  });

  it("memakai nilai awal yang diberikan", () => {
    const [value] = useInput("awal");
    expect(value.value).toBe("awal");
  });

  it("memperbarui nilai dari event input", () => {
    const [value, onChange] = useInput();
    onChange({ target: { value: "dari event" } } as unknown as Event);
    expect(value.value).toBe("dari event");
  });

  it("memperbarui nilai dari string langsung", () => {
    const [value, onChange] = useInput();
    onChange("dari string");
    expect(value.value).toBe("dari string");
  });

  it("memperbarui nilai lewat setter", () => {
    const [value, , setValue] = useInput("lama");
    setValue("baru");
    expect(value.value).toBe("baru");
  });
});
