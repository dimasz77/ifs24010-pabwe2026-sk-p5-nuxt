import apiHelper from "../../../helpers/apiHelper";

export type CashFlowType = "inflow" | "outflow";
export type CashFlowSource = "cash" | "savings" | "loans";

export interface CashFlow {
  id: string;
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  nominal: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CashFlowPayload {
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  nominal: number;
  description: string;
}

export interface CashFlowQueryParams {
  type?: CashFlowType | "";
  source?: CashFlowSource | "";
  label?: string;
  start_date?: string;
  end_date?: string;
}

export interface CashFlowStats {
  total_inflow: number;
  total_outflow: number;
  cash: number;
  savings: number;
  loans: number;
}

export interface CashFlowPeriodStat {
  date?: string;
  month?: string;
  total_inflow?: number;
  total_outflow?: number;
}

export interface CashFlowList {
  cashFlows: CashFlow[];
  stats: CashFlowStats;
}

interface CashFlowListData {
  cash_flows?: CashFlow[];
  stats?: Partial<CashFlowStats>;
}

interface CashFlowData {
  cash_flow: CashFlow;
}

interface LabelsData {
  labels?: string[];
}

interface PeriodStatsData {
  stats?: CashFlowPeriodStat[];
}

export const EMPTY_STATS: CashFlowStats = {
  total_inflow: 0,
  total_outflow: 0,
  cash: 0,
  savings: 0,
  loans: 0,
};

const JSON_HEADERS = { "Content-Type": "application/json" };

const cashFlowApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/cash-flows`;

  function _url(path = ""): string {
    return BASE_URL + path;
  }

  function buildQuery(query: CashFlowQueryParams): string {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }

  async function getCashFlows(query: CashFlowQueryParams = {}): Promise<CashFlowList> {
    const result = await apiHelper.fetchJson<CashFlowListData>(
      _url(buildQuery(query)),
      { method: "GET" },
      "Gagal mengambil data arus kas"
    );

    return {
      cashFlows: result.data.cash_flows ?? [],
      stats: { ...EMPTY_STATS, ...result.data.stats },
    };
  }

  async function getCashFlowById(cashFlowId: string): Promise<CashFlow> {
    const result = await apiHelper.fetchJson<CashFlowData>(
      _url(`/${cashFlowId}`),
      { method: "GET" },
      "Gagal mengambil detail arus kas"
    );

    return result.data.cash_flow;
  }

  async function postCashFlow(payload: CashFlowPayload): Promise<string> {
    const result = await apiHelper.fetchJson<unknown>(
      _url(),
      {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(payload),
      },
      "Gagal menambahkan catatan arus kas"
    );

    return result.message ?? "";
  }

  async function putCashFlow(cashFlowId: string, payload: CashFlowPayload): Promise<string> {
    const result = await apiHelper.fetchJson<unknown>(
      _url(`/${cashFlowId}`),
      {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify(payload),
      },
      "Gagal mengubah catatan arus kas"
    );

    return result.message ?? "";
  }

  async function deleteCashFlow(cashFlowId: string): Promise<string> {
    const result = await apiHelper.fetchJson<unknown>(
      _url(`/${cashFlowId}`),
      { method: "DELETE" },
      "Gagal menghapus catatan arus kas"
    );

    return result.message ?? "";
  }

  async function deleteAllCashFlows(): Promise<string> {
    const result = await apiHelper.fetchJson<unknown>(
      _url(),
      { method: "DELETE" },
      "Gagal mereset seluruh catatan arus kas"
    );

    return result.message ?? "";
  }

  async function getLabels(): Promise<string[]> {
    const result = await apiHelper.fetchJson<LabelsData>(
      _url("/labels"),
      { method: "GET" },
      "Gagal mengambil daftar label"
    );

    return result.data.labels ?? [];
  }

  async function getPeriodStats(period: "daily" | "monthly"): Promise<CashFlowPeriodStat[]> {
    const result = await apiHelper.fetchJson<PeriodStatsData>(
      _url(`/stats/${period}`),
      { method: "GET" },
      "Gagal mengambil statistik arus kas"
    );

    return result.data.stats ?? [];
  }

  return {
    getCashFlows,
    getCashFlowById,
    postCashFlow,
    putCashFlow,
    deleteCashFlow,
    deleteAllCashFlows,
    getLabels,
    getDailyStats: (): Promise<CashFlowPeriodStat[]> => getPeriodStats("daily"),
    getMonthlyStats: (): Promise<CashFlowPeriodStat[]> => getPeriodStats("monthly"),
  };
})();

export default cashFlowApi;
