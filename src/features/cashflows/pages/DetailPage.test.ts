import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory } from "vue-router";
import { createAppRouter } from "../../../router";
import { createMockPinia, renderWithProviders, mockCashFlow } from "../../../test-utils";
import DetailPage from "./DetailPage.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import * as toolsHelper from "../../../helpers/toolsHelper";
import type { CashFlow } from "../api/cashFlowApi";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

async function setup(result: CashFlow | "pending" | null = mockCashFlow) {
  const { pinia, cashFlowsStore } = createMockPinia();
  const detailSpy = vi.spyOn(cashFlowsStore, "asyncSetCashFlow").mockImplementation(async () => {
    if (result === "pending") {
      await new Promise<void>(() => undefined);
    }
    cashFlowsStore.setCashFlow(result === "pending" ? null : result);
  });
  const router = createAppRouter(createMemoryHistory());
  await router.push("/cash-flows/cf-1");
  await router.isReady();
  const pushSpy = vi.spyOn(router, "push").mockResolvedValue(undefined);
  const view = renderWithProviders(DetailPage, { pinia, router });
  await flushPromises();
  return { ...view, cashFlowsStore, detailSpy, pushSpy };
}

describe("DetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("memuat detail berdasarkan parameter rute", async () => {
    const { detailSpy } = await setup();

    expect(detailSpy).toHaveBeenCalledWith("cf-1");
  });

  it("menampilkan rincian transaksi pemasukan", async () => {
    const { wrapper } = await setup();

    expect(wrapper.get("h1").text()).toBe("Detail Transaksi");
    expect(wrapper.get("h2").text()).toBe("Gaji");
    expect(wrapper.get('[data-testid="detail-nominal"]').text()).toMatch(/1\.500\.000/);
    expect(wrapper.get('[data-testid="detail-nominal"]').classes()).toContain("text-emerald-700");
    expect(wrapper.text()).toContain("Pemasukan");
    expect(wrapper.text()).toContain("Tunai");
    expect(wrapper.text()).toContain("Gaji bulanan");
    expect(wrapper.text()).toContain("Februari 2026");
  });

  it("menampilkan transaksi pengeluaran tanpa keterangan", async () => {
    const { wrapper } = await setup({ ...mockCashFlow, type: "outflow", description: "" });

    expect(wrapper.get('[data-testid="detail-nominal"]').classes()).toContain("text-red-700");
    expect(wrapper.text()).toContain("Pengeluaran");
    expect(wrapper.findAll("dd").map((dd) => dd.text())).toContain("-");
  });

  it("menampilkan status loading selama data dimuat", async () => {
    const { wrapper } = await setup("pending");

    expect(wrapper.text()).toContain("Memuat detail transaksi...");
  });

  it("menampilkan pesan jika transaksi tidak ditemukan", async () => {
    const { wrapper } = await setup(null);

    expect(wrapper.find('[data-testid="not-found-state"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="detail-edit-btn"]').exists()).toBe(false);
  });

  it("membuka modal ubah, memuat ulang saat tersimpan, dan menutupnya", async () => {
    const { wrapper, detailSpy } = await setup();

    await wrapper.get('[data-testid="detail-edit-btn"]').trigger("click");
    const modal = wrapper.findComponent(ChangeModal);
    expect(modal.exists()).toBe(true);

    modal.vm.$emit("saved");
    await flushPromises();
    expect(detailSpy).toHaveBeenCalledTimes(2);

    modal.vm.$emit("close");
    await flushPromises();
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);
  });

  describe("hapus transaksi", () => {
    it("kembali ke beranda setelah berhasil dihapus", async () => {
      vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValue({ isConfirmed: true } as never);
      const { wrapper, cashFlowsStore, pushSpy } = await setup();
      const deleteSpy = vi.spyOn(cashFlowsStore, "asyncDeleteCashFlow").mockImplementation(async () => {
        cashFlowsStore.setIsCashFlowDeleted(true);
        cashFlowsStore.setIsCashFlowDelete(true);
      });

      await wrapper.get('[data-testid="detail-delete-btn"]').trigger("click");
      await flushPromises();

      expect(deleteSpy).toHaveBeenCalledWith("cf-1");
      expect(pushSpy).toHaveBeenCalledWith("/");
      expect(cashFlowsStore.isCashFlowDeleted).toBe(false);
    });

    it("tidak menghapus jika dibatalkan", async () => {
      vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValue({ isConfirmed: false } as never);
      const { wrapper, cashFlowsStore } = await setup();
      const deleteSpy = vi.spyOn(cashFlowsStore, "asyncDeleteCashFlow");

      await wrapper.get('[data-testid="detail-delete-btn"]').trigger("click");
      await flushPromises();

      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it("tetap di halaman jika penghapusan gagal", async () => {
      vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValue({ isConfirmed: true } as never);
      const { wrapper, cashFlowsStore, pushSpy } = await setup();
      vi.spyOn(cashFlowsStore, "asyncDeleteCashFlow").mockImplementation(async () => {
        cashFlowsStore.setIsCashFlowDeleted(false);
        cashFlowsStore.setIsCashFlowDelete(true);
      });

      await wrapper.get('[data-testid="detail-delete-btn"]').trigger("click");
      await flushPromises();

      expect(pushSpy).not.toHaveBeenCalled();
    });
  });
});
