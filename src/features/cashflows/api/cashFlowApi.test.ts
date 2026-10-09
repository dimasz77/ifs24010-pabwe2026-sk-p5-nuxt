import { describe, it, expect, vi, beforeEach } from "vitest";
import cashFlowApi, { EMPTY_STATS, type CashFlowPayload } from "./cashFlowApi";
import { mockCashFlow, mockJsonResponse, mockStats } from "../../../test-utils";

const BASE = "https://open-api.delcom.org/api/v1/cash-flows";

const payload: CashFlowPayload = {
  type: "outflow",
  source: "savings",
  label: "Makan",
  nominal: 25000,
  description: "Makan siang",
};

describe("cashFlowApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe("getCashFlows", () => {
    it("mengambil daftar tanpa filter beserta statistik", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        mockJsonResponse({ success: true, data: { cash_flows: [mockCashFlow], stats: mockStats } })
      );
      vi.stubGlobal("fetch", mockFetch);

      const result = await cashFlowApi.getCashFlows();

      expect(result).toEqual({ cashFlows: [mockCashFlow], stats: mockStats });
      expect(mockFetch).toHaveBeenCalledWith(BASE, expect.objectContaining({ method: "GET" }));
    });

    it("hanya menyertakan filter yang terisi pada query string", async () => {
      const mockFetch = vi.fn().mockResolvedValue(mockJsonResponse({ success: true, data: {} }));
      vi.stubGlobal("fetch", mockFetch);

      const result = await cashFlowApi.getCashFlows({
        type: "inflow",
        source: "",
        label: "Gaji",
        start_date: "2026-01-01",
        end_date: "2026-01-31",
      });

      expect(result).toEqual({ cashFlows: [], stats: EMPTY_STATS });
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}?type=inflow&label=Gaji&start_date=2026-01-01&end_date=2026-01-31`,
        expect.anything()
      );
    });

    it("melempar error saat gagal", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({ success: false, message: "Token tidak valid", data: null })));

      await expect(cashFlowApi.getCashFlows()).rejects.toThrow("Token tidak valid");
    });
  });

  it("getCashFlowById mengambil detail", async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockJsonResponse({ success: true, data: { cash_flow: mockCashFlow } }));
    vi.stubGlobal("fetch", mockFetch);

    expect(await cashFlowApi.getCashFlowById("cf-1")).toEqual(mockCashFlow);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE}/cf-1`, expect.anything());
  });

  it("postCashFlow mengirim payload", async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockJsonResponse({ success: true, message: "Ditambahkan" }));
    vi.stubGlobal("fetch", mockFetch);

    expect(await cashFlowApi.postCashFlow(payload)).toBe("Ditambahkan");
    expect(mockFetch).toHaveBeenCalledWith(BASE, expect.objectContaining({ method: "POST", body: JSON.stringify(payload) }));
  });

  it("putCashFlow memperbarui catatan", async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockJsonResponse({ success: true, message: "Diubah" }));
    vi.stubGlobal("fetch", mockFetch);

    expect(await cashFlowApi.putCashFlow("cf-1", payload)).toBe("Diubah");
    expect(mockFetch).toHaveBeenCalledWith(`${BASE}/cf-1`, expect.objectContaining({ method: "PUT" }));
  });

  it("deleteCashFlow menghapus satu catatan", async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockJsonResponse({ success: true, message: "Dihapus" }));
    vi.stubGlobal("fetch", mockFetch);

    expect(await cashFlowApi.deleteCashFlow("cf-1")).toBe("Dihapus");
    expect(mockFetch).toHaveBeenCalledWith(`${BASE}/cf-1`, expect.objectContaining({ method: "DELETE" }));
  });

  it("deleteAllCashFlows mereset seluruh catatan", async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockJsonResponse({ success: true, message: "Direset" }));
    vi.stubGlobal("fetch", mockFetch);

    expect(await cashFlowApi.deleteAllCashFlows()).toBe("Direset");
    expect(mockFetch).toHaveBeenCalledWith(BASE, expect.objectContaining({ method: "DELETE" }));
  });

  it.each([
    ["postCashFlow", () => cashFlowApi.postCashFlow(payload)],
    ["putCashFlow", () => cashFlowApi.putCashFlow("cf-1", payload)],
    ["deleteCashFlow", () => cashFlowApi.deleteCashFlow("cf-1")],
    ["deleteAllCashFlows", () => cashFlowApi.deleteAllCashFlows()],
  ])("%s memberi string kosong jika server tidak mengirim pesan", async (_name, action) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({ success: true })));

    expect(await action()).toBe("");
  });

  it("getLabels mengembalikan daftar label atau array kosong", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(mockJsonResponse({ success: true, data: { labels: ["Gaji", "Makan"] } }))
      .mockResolvedValueOnce(mockJsonResponse({ success: true, data: {} }));
    vi.stubGlobal("fetch", mockFetch);

    expect(await cashFlowApi.getLabels()).toEqual(["Gaji", "Makan"]);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE}/labels`, expect.anything());
    expect(await cashFlowApi.getLabels()).toEqual([]);
  });

  it("getDailyStats dan getMonthlyStats mengambil statistik periode", async () => {
    const daily = [{ date: "2026-02-01", total_inflow: 1, total_outflow: 2 }];
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(mockJsonResponse({ success: true, data: { stats: daily } }))
      .mockResolvedValueOnce(mockJsonResponse({ success: true, data: {} }));
    vi.stubGlobal("fetch", mockFetch);

    expect(await cashFlowApi.getDailyStats()).toEqual(daily);
    expect(mockFetch).toHaveBeenNthCalledWith(1, `${BASE}/stats/daily`, expect.anything());
    expect(await cashFlowApi.getMonthlyStats()).toEqual([]);
    expect(mockFetch).toHaveBeenNthCalledWith(2, `${BASE}/stats/monthly`, expect.anything());
  });
});
