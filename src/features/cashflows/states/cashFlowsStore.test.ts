import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCashFlowsStore } from "./cashFlowsStore";
import cashFlowApi, { EMPTY_STATS, type CashFlowPayload } from "../api/cashFlowApi";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { mockCashFlow, mockStats } from "../../../test-utils";

vi.mock("../api/cashFlowApi", async (importOriginal) => {
  const original = await importOriginal<typeof import("../api/cashFlowApi")>();
  return {
    ...original,
    default: {
      getCashFlows: vi.fn(),
      getCashFlowById: vi.fn(),
      postCashFlow: vi.fn(),
      putCashFlow: vi.fn(),
      deleteCashFlow: vi.fn(),
      deleteAllCashFlows: vi.fn(),
      getLabels: vi.fn(),
      getDailyStats: vi.fn(),
      getMonthlyStats: vi.fn(),
    },
  };
});
vi.mock("../../../helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  getErrorMessage: (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback),
}));

const payload: CashFlowPayload = {
  type: "inflow",
  source: "cash",
  label: "Gaji",
  nominal: 1000,
  description: "",
};

describe("cashFlowsStore", () => {
  let store: ReturnType<typeof useCashFlowsStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useCashFlowsStore();
    vi.clearAllMocks();
  });

  it("memiliki state awal yang benar", () => {
    expect(store.cashFlows).toEqual([]);
    expect(store.cashFlow).toBeNull();
    expect(store.stats).toEqual(EMPTY_STATS);
    expect(store.labels).toEqual([]);
    expect(store.query).toEqual({});
    expect(store.isCashFlowsLoading).toBe(false);
  });

  it("memperbarui state lewat setter", () => {
    store.setCashFlows([mockCashFlow]);
    store.setCashFlow(mockCashFlow);
    store.setStats(mockStats);
    store.setLabels(["Gaji"]);
    store.setQuery({ type: "inflow" });
    store.setIsCashFlowsLoading(true);
    store.setIsCashFlowAdd(true);
    store.setIsCashFlowAdded(true);
    store.setIsCashFlowChange(true);
    store.setIsCashFlowChanged(true);
    store.setIsCashFlowDelete(true);
    store.setIsCashFlowDeleted(true);
    store.setIsCashFlowDeleteAll(true);
    store.setIsCashFlowDeletedAll(true);

    expect(store.cashFlows).toEqual([mockCashFlow]);
    expect(store.cashFlow).toEqual(mockCashFlow);
    expect(store.stats).toEqual(mockStats);
    expect(store.labels).toEqual(["Gaji"]);
    expect(store.query).toEqual({ type: "inflow" });
    expect(
      [
        store.isCashFlowsLoading,
        store.isCashFlowAdd,
        store.isCashFlowAdded,
        store.isCashFlowChange,
        store.isCashFlowChanged,
        store.isCashFlowDelete,
        store.isCashFlowDeleted,
        store.isCashFlowDeleteAll,
        store.isCashFlowDeletedAll,
      ].every(Boolean)
    ).toBe(true);
  });

  describe("asyncSetCashFlows / asyncRefreshCashFlows", () => {
    it("menyimpan query dan memuat data", async () => {
      vi.mocked(cashFlowApi.getCashFlows).mockResolvedValueOnce({ cashFlows: [mockCashFlow], stats: mockStats });

      await store.asyncSetCashFlows({ type: "inflow" });

      expect(cashFlowApi.getCashFlows).toHaveBeenCalledWith({ type: "inflow" });
      expect(store.cashFlows).toEqual([mockCashFlow]);
      expect(store.stats).toEqual(mockStats);
      expect(store.isCashFlowsLoading).toBe(false);
    });

    it("mengosongkan data dan menampilkan error saat gagal", async () => {
      store.setCashFlows([mockCashFlow]);
      vi.mocked(cashFlowApi.getCashFlows).mockRejectedValueOnce(new Error("Server error"));

      await store.asyncRefreshCashFlows();

      expect(store.cashFlows).toEqual([]);
      expect(store.stats).toEqual(EMPTY_STATS);
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Server error");
      expect(store.isCashFlowsLoading).toBe(false);
    });
  });

  it("asyncSetCashFlow mengisi detail, atau null saat gagal", async () => {
    vi.mocked(cashFlowApi.getCashFlowById).mockResolvedValueOnce(mockCashFlow);
    await store.asyncSetCashFlow("cf-1");
    expect(store.cashFlow).toEqual(mockCashFlow);

    vi.mocked(cashFlowApi.getCashFlowById).mockRejectedValueOnce(new Error("404"));
    await store.asyncSetCashFlow("cf-x");
    expect(store.cashFlow).toBeNull();
  });

  it("asyncSetLabels mengisi label, atau kosong saat gagal", async () => {
    vi.mocked(cashFlowApi.getLabels).mockResolvedValueOnce(["Gaji"]);
    await store.asyncSetLabels();
    expect(store.labels).toEqual(["Gaji"]);

    vi.mocked(cashFlowApi.getLabels).mockRejectedValueOnce(new Error("gagal"));
    await store.asyncSetLabels();
    expect(store.labels).toEqual([]);
  });

  it("asyncSetDailyStats mengisi statistik harian, atau kosong saat gagal", async () => {
    const daily = [{ date: "2026-02-01", total_inflow: 1, total_outflow: 0 }];
    vi.mocked(cashFlowApi.getDailyStats).mockResolvedValueOnce(daily);
    await store.asyncSetDailyStats();
    expect(store.dailyStats).toEqual(daily);

    vi.mocked(cashFlowApi.getDailyStats).mockRejectedValueOnce(new Error("gagal"));
    await store.asyncSetDailyStats();
    expect(store.dailyStats).toEqual([]);
  });

  it("asyncSetMonthlyStats mengisi statistik bulanan, atau kosong saat gagal", async () => {
    const monthly = [{ month: "2026-02", total_inflow: 1, total_outflow: 0 }];
    vi.mocked(cashFlowApi.getMonthlyStats).mockResolvedValueOnce(monthly);
    await store.asyncSetMonthlyStats();
    expect(store.monthlyStats).toEqual(monthly);

    vi.mocked(cashFlowApi.getMonthlyStats).mockRejectedValueOnce(new Error("gagal"));
    await store.asyncSetMonthlyStats();
    expect(store.monthlyStats).toEqual([]);
  });

  describe.each([
    {
      name: "asyncAddCashFlow",
      run: (s: typeof store) => s.asyncAddCashFlow(payload),
      api: () => vi.mocked(cashFlowApi.postCashFlow),
      done: (s: typeof store) => s.isCashFlowAdd,
      succeeded: (s: typeof store) => s.isCashFlowAdded,
      fallback: "Gagal menambahkan catatan arus kas",
    },
    {
      name: "asyncChangeCashFlow",
      run: (s: typeof store) => s.asyncChangeCashFlow("cf-1", payload),
      api: () => vi.mocked(cashFlowApi.putCashFlow),
      done: (s: typeof store) => s.isCashFlowChange,
      succeeded: (s: typeof store) => s.isCashFlowChanged,
      fallback: "Gagal mengubah catatan arus kas",
    },
    {
      name: "asyncDeleteCashFlow",
      run: (s: typeof store) => s.asyncDeleteCashFlow("cf-1"),
      api: () => vi.mocked(cashFlowApi.deleteCashFlow),
      done: (s: typeof store) => s.isCashFlowDelete,
      succeeded: (s: typeof store) => s.isCashFlowDeleted,
      fallback: "Gagal menghapus catatan arus kas",
    },
    {
      name: "asyncDeleteAllCashFlows",
      run: (s: typeof store) => s.asyncDeleteAllCashFlows(),
      api: () => vi.mocked(cashFlowApi.deleteAllCashFlows),
      done: (s: typeof store) => s.isCashFlowDeleteAll,
      succeeded: (s: typeof store) => s.isCashFlowDeletedAll,
      fallback: "Gagal mereset catatan arus kas",
    },
  ])("$name", ({ run, api, done, succeeded, fallback }) => {
    it("berhasil dan menampilkan dialog sukses", async () => {
      api().mockResolvedValueOnce("Berhasil");

      await run(store);

      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Berhasil");
      expect(succeeded(store)).toBe(true);
      expect(done(store)).toBe(true);
    });

    it("gagal dan menampilkan pesan error dari server", async () => {
      api().mockRejectedValueOnce(new Error("Ditolak server"));

      await run(store);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Ditolak server");
      expect(succeeded(store)).toBe(false);
      expect(done(store)).toBe(true);
    });

    it("memakai pesan fallback jika error bukan instance Error", async () => {
      api().mockRejectedValueOnce("aneh");

      await run(store);

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(fallback);
    });
  });
});
