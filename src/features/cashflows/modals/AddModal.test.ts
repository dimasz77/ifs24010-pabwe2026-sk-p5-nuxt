import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { renderWithProviders } from "../../../test-utils";
import AddModal from "./AddModal.vue";

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  getErrorMessage: () => "error",
}));

async function fillAndSubmit(wrapper: ReturnType<typeof renderWithProviders>["wrapper"]): Promise<void> {
  await wrapper.get('[data-testid="add-label-input"]').setValue("Gaji");
  await wrapper.get('[data-testid="add-nominal-input"]').setValue("1000000");
  await wrapper.get("form").trigger("submit");
  await flushPromises();
}

describe("AddModal", () => {
  it("menampilkan dialog dengan form kosong", () => {
    const { wrapper } = renderWithProviders(AddModal);

    expect(wrapper.get("dialog").exists()).toBe(true);
    expect(wrapper.text()).toContain("Tambah Catatan Arus Kas");
    expect((wrapper.get('[data-testid="add-label-input"]').element as HTMLInputElement).value).toBe("");
  });

  it("menyimpan data, lalu memancarkan saved dan close saat berhasil", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(AddModal);
    const addSpy = vi.spyOn(cashFlowsStore, "asyncAddCashFlow").mockImplementation(async () => {
      cashFlowsStore.setIsCashFlowAdded(true);
      cashFlowsStore.setIsCashFlowAdd(true);
    });

    await fillAndSubmit(wrapper);

    expect(addSpy).toHaveBeenCalledWith({
      type: "inflow",
      source: "cash",
      label: "Gaji",
      nominal: 1000000,
      description: "",
    });
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
    expect(cashFlowsStore.isCashFlowAdd).toBe(false);
    expect(cashFlowsStore.isCashFlowAdded).toBe(false);
  });

  it("tetap terbuka dan tidak memancarkan event saat gagal", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(AddModal);
    vi.spyOn(cashFlowsStore, "asyncAddCashFlow").mockImplementation(async () => {
      cashFlowsStore.setIsCashFlowAdded(false);
      cashFlowsStore.setIsCashFlowAdd(true);
    });

    await fillAndSubmit(wrapper);

    expect(wrapper.emitted("saved")).toBeUndefined();
    expect(wrapper.emitted("close")).toBeUndefined();
    expect(wrapper.get('[data-testid="add-submit-btn"]').text()).toBe("Tambah Catatan");
  });

  it("memancarkan close dari tombol batal dan tombol tutup", async () => {
    const { wrapper } = renderWithProviders(AddModal);

    await wrapper.get('[data-testid="add-cancel-btn"]').trigger("click");
    await wrapper.get('[data-testid="close-modal-btn"]').trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});
