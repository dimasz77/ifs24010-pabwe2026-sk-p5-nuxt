import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMockPinia, renderWithProviders, mockCashFlow, mockStats } from "../../../test-utils";
import HomePage from "./HomePage.vue";
import AddModal from "../modals/AddModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import * as toolsHelper from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

const outflow = { ...mockCashFlow, id: "cf-2", type: "outflow" as const, source: "savings" as const, label: "Makan", nominal: 25000 };

function setup(state: Record<string, unknown> = {}) {
  const { pinia, cashFlowsStore } = createMockPinia({
    cashFlows: [mockCashFlow, outflow],
    stats: mockStats,
    labels: ["Gaji", "Makan"],
    ...state,
  });
  const refreshSpy = vi.spyOn(cashFlowsStore, "asyncRefreshCashFlows").mockResolvedValue();
  const labelsSpy = vi.spyOn(cashFlowsStore, "asyncSetLabels").mockResolvedValue();
  const setSpy = vi.spyOn(cashFlowsStore, "asyncSetCashFlows").mockResolvedValue();
  const view = renderWithProviders(HomePage, { pinia });
  return { ...view, cashFlowsStore, refreshSpy, labelsSpy, setSpy };
}

function confirm(isConfirmed: boolean): void {
  vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValue({ isConfirmed } as never);
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("memuat transaksi dan label saat dimuat", () => {
    const { refreshSpy, labelsSpy } = setup();

    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(labelsSpy).toHaveBeenCalledTimes(1);
  });

  it("menampilkan enam kartu metrik dengan saldo bersih", () => {
    const { wrapper } = setup();

    expect(wrapper.findAll('[data-testid^="metric-"]')).toHaveLength(6);
    expect(wrapper.get('[data-testid="metric-balance"]').text()).toMatch(/1\.500\.000/);
    expect(wrapper.get('[data-testid="metric-inflow"]').text()).toMatch(/2\.000\.000/);
    expect(wrapper.get('[data-testid="metric-outflow"]').text()).toMatch(/500\.000/);
    expect(wrapper.get('[data-testid="metric-cash"]').text()).toMatch(/800\.000/);
    expect(wrapper.get('[data-testid="metric-savings"]').text()).toMatch(/600\.000/);
    expect(wrapper.get('[data-testid="metric-loans"]').text()).toMatch(/100\.000/);
  });

  it("menampilkan tabel transaksi dengan badge jenis yang sesuai", () => {
    const { wrapper } = setup();

    const rows = wrapper.findAll("tbody tr");
    expect(rows).toHaveLength(2);
    expect(rows[0]?.text()).toContain("Pemasukan");
    expect(rows[0]?.text()).toContain("Tunai");
    expect(rows[1]?.text()).toContain("Pengeluaran");
    expect(rows[1]?.text()).toContain("Tabungan");
    expect(rows[0]?.find("td:nth-child(5)").classes()).toContain("text-emerald-700");
    expect(rows[1]?.find("td:nth-child(5)").classes()).toContain("text-red-700");
  });

  it("menampilkan status loading dan status kosong", () => {
    const loading = setup({ isCashFlowsLoading: true });
    expect(loading.wrapper.text()).toContain("Memuat data arus kas...");

    const empty = setup({ cashFlows: [] });
    expect(empty.wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
  });

  it("menerapkan filter ke store", async () => {
    const { wrapper, setSpy } = setup();

    await wrapper.get('[data-testid="filter-type"]').setValue("inflow");
    await wrapper.get('[data-testid="filter-source"]').setValue("cash");
    await wrapper.get('[data-testid="filter-label"]').setValue("Gaji");
    await wrapper.get('[data-testid="filter-start-date"]').setValue("2026-01-01");
    await wrapper.get('[data-testid="filter-end-date"]').setValue("2026-01-31");
    await wrapper.findAll("form")[0]?.trigger("submit");

    expect(setSpy).toHaveBeenCalledWith({
      type: "inflow",
      source: "cash",
      label: "Gaji",
      start_date: "2026-01-01",
      end_date: "2026-01-31",
    });
  });

  it("mengatur ulang filter", async () => {
    const { wrapper, setSpy } = setup();
    await wrapper.get('[data-testid="filter-type"]').setValue("outflow");

    await wrapper.get('[data-testid="reset-filter-btn"]').trigger("click");

    expect((wrapper.get('[data-testid="filter-type"]').element as HTMLSelectElement).value).toBe("");
    expect(setSpy).toHaveBeenCalledWith({});
  });

  it("membuka modal tambah, memuat ulang saat tersimpan, dan menutupnya", async () => {
    const { wrapper, refreshSpy, labelsSpy } = setup();
    expect(wrapper.findComponent(AddModal).exists()).toBe(false);

    await wrapper.get('[data-testid="open-add-modal-btn"]').trigger("click");
    const modal = wrapper.findComponent(AddModal);
    expect(modal.exists()).toBe(true);

    modal.vm.$emit("saved");
    await flushPromises();
    expect(refreshSpy).toHaveBeenCalledTimes(2);
    expect(labelsSpy).toHaveBeenCalledTimes(2);

    modal.vm.$emit("close");
    await flushPromises();
    expect(wrapper.findComponent(AddModal).exists()).toBe(false);
  });

  it("membuka modal ubah untuk transaksi terpilih dan menutupnya", async () => {
    const { wrapper } = setup();

    await wrapper.get('[data-testid="edit-btn-cf-2"]').trigger("click");
    const modal = wrapper.findComponent(ChangeModal);
    expect(modal.props("cashFlow")).toEqual(outflow);

    modal.vm.$emit("close");
    await flushPromises();
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);
  });

  it("menautkan tombol detail ke halaman detail", () => {
    const { wrapper } = setup();

    expect(wrapper.get('[data-testid="detail-btn-cf-1"]').attributes("href")).toBe("/cash-flows/cf-1");
  });

  describe("hapus transaksi", () => {
    it("menghapus dan memuat ulang setelah dikonfirmasi", async () => {
      confirm(true);
      const { wrapper, cashFlowsStore, refreshSpy } = setup();
      const deleteSpy = vi.spyOn(cashFlowsStore, "asyncDeleteCashFlow").mockImplementation(async () => {
        cashFlowsStore.setIsCashFlowDeleted(true);
        cashFlowsStore.setIsCashFlowDelete(true);
      });

      await wrapper.get('[data-testid="delete-btn-cf-1"]').trigger("click");
      await flushPromises();

      expect(deleteSpy).toHaveBeenCalledWith("cf-1");
      expect(refreshSpy).toHaveBeenCalledTimes(2);
      expect(cashFlowsStore.isCashFlowDelete).toBe(false);
      expect(cashFlowsStore.isCashFlowDeleted).toBe(false);
    });

    it("tidak menghapus jika dibatalkan", async () => {
      confirm(false);
      const { wrapper, cashFlowsStore } = setup();
      const deleteSpy = vi.spyOn(cashFlowsStore, "asyncDeleteCashFlow");

      await wrapper.get('[data-testid="delete-btn-cf-1"]').trigger("click");
      await flushPromises();

      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it("tidak memuat ulang jika penghapusan gagal", async () => {
      confirm(true);
      const { wrapper, cashFlowsStore, refreshSpy } = setup();
      vi.spyOn(cashFlowsStore, "asyncDeleteCashFlow").mockImplementation(async () => {
        cashFlowsStore.setIsCashFlowDeleted(false);
        cashFlowsStore.setIsCashFlowDelete(true);
      });

      await wrapper.get('[data-testid="delete-btn-cf-1"]').trigger("click");
      await flushPromises();

      expect(refreshSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("reset semua transaksi", () => {
    it("mereset dan memuat ulang setelah dikonfirmasi", async () => {
      confirm(true);
      const { wrapper, cashFlowsStore, refreshSpy } = setup();
      const resetSpy = vi.spyOn(cashFlowsStore, "asyncDeleteAllCashFlows").mockImplementation(async () => {
        cashFlowsStore.setIsCashFlowDeletedAll(true);
        cashFlowsStore.setIsCashFlowDeleteAll(true);
      });

      await wrapper.get('[data-testid="reset-all-btn"]').trigger("click");
      await flushPromises();

      expect(resetSpy).toHaveBeenCalledTimes(1);
      expect(refreshSpy).toHaveBeenCalledTimes(2);
      expect(cashFlowsStore.isCashFlowDeleteAll).toBe(false);
      expect(cashFlowsStore.isCashFlowDeletedAll).toBe(false);
    });

    it("tidak mereset jika dibatalkan", async () => {
      confirm(false);
      const { wrapper, cashFlowsStore } = setup();
      const resetSpy = vi.spyOn(cashFlowsStore, "asyncDeleteAllCashFlows");

      await wrapper.get('[data-testid="reset-all-btn"]').trigger("click");
      await flushPromises();

      expect(resetSpy).not.toHaveBeenCalled();
    });

    it("tidak memuat ulang jika reset gagal", async () => {
      confirm(true);
      const { wrapper, cashFlowsStore, refreshSpy } = setup();
      vi.spyOn(cashFlowsStore, "asyncDeleteAllCashFlows").mockImplementation(async () => {
        cashFlowsStore.setIsCashFlowDeletedAll(false);
        cashFlowsStore.setIsCashFlowDeleteAll(true);
      });

      await wrapper.get('[data-testid="reset-all-btn"]').trigger("click");
      await flushPromises();

      expect(refreshSpy).toHaveBeenCalledTimes(1);
    });
  });
});
