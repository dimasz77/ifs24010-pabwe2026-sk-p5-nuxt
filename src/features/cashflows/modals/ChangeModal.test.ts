import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { renderWithProviders, mockCashFlow } from "../../../test-utils";
import ChangeModal from "./ChangeModal.vue";

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  getErrorMessage: () => "error",
}));

function renderModal() {
  return renderWithProviders(ChangeModal, { props: { cashFlow: mockCashFlow } });
}

describe("ChangeModal", () => {
  it("menampilkan form yang terisi data transaksi", () => {
    const { wrapper } = renderModal();

    expect(wrapper.text()).toContain("Ubah Catatan Arus Kas");
    expect((wrapper.get('[data-testid="change-label-input"]').element as HTMLInputElement).value).toBe("Gaji");
    expect((wrapper.get('[data-testid="change-nominal-input"]').element as HTMLInputElement).value).toBe("1500000");
  });

  it("menyimpan perubahan lalu memancarkan saved dan close", async () => {
    const { wrapper, cashFlowsStore } = renderModal();
    const changeSpy = vi.spyOn(cashFlowsStore, "asyncChangeCashFlow").mockImplementation(async () => {
      cashFlowsStore.setIsCashFlowChanged(true);
      cashFlowsStore.setIsCashFlowChange(true);
    });

    await wrapper.get('[data-testid="change-label-input"]').setValue("Bonus");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(changeSpy).toHaveBeenCalledWith("cf-1", expect.objectContaining({ label: "Bonus", nominal: 1500000 }));
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
    expect(cashFlowsStore.isCashFlowChange).toBe(false);
    expect(cashFlowsStore.isCashFlowChanged).toBe(false);
  });

  it("tidak memancarkan event jika gagal", async () => {
    const { wrapper, cashFlowsStore } = renderModal();
    vi.spyOn(cashFlowsStore, "asyncChangeCashFlow").mockImplementation(async () => {
      cashFlowsStore.setIsCashFlowChanged(false);
      cashFlowsStore.setIsCashFlowChange(true);
    });

    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.emitted("saved")).toBeUndefined();
    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("memancarkan close dari tombol batal", async () => {
    const { wrapper } = renderModal();

    await wrapper.get('[data-testid="change-cancel-btn"]').trigger("click");
    await wrapper.get('[data-testid="close-modal-btn"]').trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});
