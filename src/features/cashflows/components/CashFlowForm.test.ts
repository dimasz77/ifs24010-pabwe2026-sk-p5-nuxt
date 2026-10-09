import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import CashFlowForm from "./CashFlowForm.vue";
import * as toolsHelper from "../../../helpers/toolsHelper";
import type { CashFlowPayload } from "../api/cashFlowApi";

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
}));

const initial: CashFlowPayload = {
  type: "outflow",
  source: "savings",
  label: "Makan",
  nominal: 25000,
  description: "Makan siang",
};

function renderForm(overrides: Partial<{ loading: boolean; initial: CashFlowPayload; labels: string[] }> = {}) {
  return renderWithProviders(CashFlowForm, {
    props: {
      initial: overrides.initial ?? initial,
      idPrefix: "uji",
      submitLabel: "Simpan",
      loading: overrides.loading ?? false,
    },
    preloadedState: { labels: overrides.labels ?? [] },
  });
}

describe("CashFlowForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mengisi form dengan data awal", () => {
    const { wrapper } = renderForm();

    expect((wrapper.get('[data-testid="uji-type-select"]').element as HTMLSelectElement).value).toBe("outflow");
    expect((wrapper.get('[data-testid="uji-source-select"]').element as HTMLSelectElement).value).toBe("savings");
    expect((wrapper.get('[data-testid="uji-label-input"]').element as HTMLInputElement).value).toBe("Makan");
    expect((wrapper.get('[data-testid="uji-nominal-input"]').element as HTMLInputElement).value).toBe("25000");
    expect((wrapper.get('[data-testid="uji-description-input"]').element as HTMLTextAreaElement).value).toBe("Makan siang");
  });

  it("menyediakan saran label dari store", () => {
    const { wrapper } = renderForm({ labels: ["Gaji", "Makan"] });

    const options = wrapper.findAll("datalist option").map((option) => option.attributes("value"));
    expect(options).toEqual(["Gaji", "Makan"]);
  });

  it("memancarkan payload yang sudah dirapikan saat disubmit", async () => {
    const { wrapper } = renderForm();

    await wrapper.get('[data-testid="uji-type-select"]').setValue("inflow");
    await wrapper.get('[data-testid="uji-source-select"]').setValue("loans");
    await wrapper.get('[data-testid="uji-label-input"]').setValue("  Gaji  ");
    await wrapper.get('[data-testid="uji-nominal-input"]').setValue("1500000");
    await wrapper.get('[data-testid="uji-description-input"]').setValue("  Bulanan ");
    await wrapper.get("form").trigger("submit");

    expect(wrapper.emitted("submit")?.[0]).toEqual([
      { type: "inflow", source: "loans", label: "Gaji", nominal: 1500000, description: "Bulanan" },
    ]);
  });

  it("menolak label kosong", async () => {
    const { wrapper } = renderForm();

    await wrapper.get('[data-testid="uji-label-input"]').setValue("   ");
    await wrapper.get("form").trigger("submit");

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Label kategori tidak boleh kosong");
    expect(wrapper.emitted("submit")).toBeUndefined();
  });

  it.each(["0", "-5", ""])("menolak nominal tidak valid (%j)", async (value) => {
    const { wrapper } = renderForm();

    await wrapper.get('[data-testid="uji-nominal-input"]').setValue(value);
    await wrapper.get("form").trigger("submit");

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Nominal harus berupa angka lebih dari 0");
    expect(wrapper.emitted("submit")).toBeUndefined();
  });

  it("menolak nominal bukan angka", async () => {
    const { wrapper } = renderForm();
    const input = wrapper.get('[data-testid="uji-nominal-input"]').element as HTMLInputElement;
    Object.defineProperty(input, "value", { value: "abc", configurable: true });
    await wrapper.get('[data-testid="uji-nominal-input"]').trigger("input");

    await wrapper.get("form").trigger("submit");

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Nominal harus berupa angka lebih dari 0");
  });

  it("memancarkan cancel dari tombol batal", async () => {
    const { wrapper } = renderForm();

    await wrapper.get('[data-testid="uji-cancel-btn"]').trigger("click");

    expect(wrapper.emitted("cancel")).toHaveLength(1);
  });

  it("menonaktifkan tombol dan mengubah teks saat loading", () => {
    const { wrapper } = renderForm({ loading: true });

    const submit = wrapper.get('[data-testid="uji-submit-btn"]');
    expect(submit.text()).toBe("Menyimpan...");
    expect(submit.attributes("disabled")).toBeDefined();
    expect(wrapper.get('[data-testid="uji-cancel-btn"]').attributes("disabled")).toBeDefined();
  });

  it("menampilkan label tombol submit saat tidak loading", () => {
    const { wrapper } = renderForm();

    expect(wrapper.get('[data-testid="uji-submit-btn"]').text()).toBe("Simpan");
  });
});
