import { defineStore } from "pinia";
import cashFlowApi, {
  EMPTY_STATS,
  type CashFlow,
  type CashFlowPayload,
  type CashFlowPeriodStat,
  type CashFlowQueryParams,
  type CashFlowStats,
} from "../api/cashFlowApi";
import { getErrorMessage, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export type { CashFlow, CashFlowQueryParams, CashFlowStats };

export interface CashFlowsState {
  cashFlows: CashFlow[];
  cashFlow: CashFlow | null;
  stats: CashFlowStats;
  labels: string[];
  dailyStats: CashFlowPeriodStat[];
  monthlyStats: CashFlowPeriodStat[];
  query: CashFlowQueryParams;
  isCashFlowsLoading: boolean;
  isCashFlowAdd: boolean;
  isCashFlowAdded: boolean;
  isCashFlowChange: boolean;
  isCashFlowChanged: boolean;
  isCashFlowDelete: boolean;
  isCashFlowDeleted: boolean;
  isCashFlowDeleteAll: boolean;
  isCashFlowDeletedAll: boolean;
}

export const useCashFlowsStore = defineStore("cashFlows", {
  state: (): CashFlowsState => ({
    cashFlows: [],
    cashFlow: null,
    stats: { ...EMPTY_STATS },
    labels: [],
    dailyStats: [],
    monthlyStats: [],
    query: {},
    isCashFlowsLoading: false,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false,
  }),
  actions: {
    setCashFlows(cashFlows: CashFlow[]): void {
      this.cashFlows = cashFlows;
    },
    setCashFlow(cashFlow: CashFlow | null): void {
      this.cashFlow = cashFlow;
    },
    setStats(stats: CashFlowStats): void {
      this.stats = stats;
    },
    setLabels(labels: string[]): void {
      this.labels = labels;
    },
    setQuery(query: CashFlowQueryParams): void {
      this.query = query;
    },
    setIsCashFlowsLoading(status: boolean): void {
      this.isCashFlowsLoading = status;
    },
    setIsCashFlowAdd(status: boolean): void {
      this.isCashFlowAdd = status;
    },
    setIsCashFlowAdded(status: boolean): void {
      this.isCashFlowAdded = status;
    },
    setIsCashFlowChange(status: boolean): void {
      this.isCashFlowChange = status;
    },
    setIsCashFlowChanged(status: boolean): void {
      this.isCashFlowChanged = status;
    },
    setIsCashFlowDelete(status: boolean): void {
      this.isCashFlowDelete = status;
    },
    setIsCashFlowDeleted(status: boolean): void {
      this.isCashFlowDeleted = status;
    },
    setIsCashFlowDeleteAll(status: boolean): void {
      this.isCashFlowDeleteAll = status;
    },
    setIsCashFlowDeletedAll(status: boolean): void {
      this.isCashFlowDeletedAll = status;
    },
    async asyncSetCashFlows(query: CashFlowQueryParams): Promise<void> {
      this.setQuery(query);
      await this.asyncRefreshCashFlows();
    },
    async asyncRefreshCashFlows(): Promise<void> {
      this.setIsCashFlowsLoading(true);
      try {
        const result = await cashFlowApi.getCashFlows(this.query);
        this.setCashFlows(result.cashFlows);
        this.setStats(result.stats);
      } catch (error: unknown) {
        this.setCashFlows([]);
        this.setStats({ ...EMPTY_STATS });
        void showErrorDialog(getErrorMessage(error, "Gagal mengambil data arus kas"));
      } finally {
        this.setIsCashFlowsLoading(false);
      }
    },
    async asyncSetCashFlow(cashFlowId: string): Promise<void> {
      try {
        this.setCashFlow(await cashFlowApi.getCashFlowById(cashFlowId));
      } catch {
        this.setCashFlow(null);
      }
    },
    async asyncSetLabels(): Promise<void> {
      try {
        this.setLabels(await cashFlowApi.getLabels());
      } catch {
        this.setLabels([]);
      }
    },
    async asyncSetDailyStats(): Promise<void> {
      try {
        this.dailyStats = await cashFlowApi.getDailyStats();
      } catch {
        this.dailyStats = [];
      }
    },
    async asyncSetMonthlyStats(): Promise<void> {
      try {
        this.monthlyStats = await cashFlowApi.getMonthlyStats();
      } catch {
        this.monthlyStats = [];
      }
    },
    async asyncAddCashFlow(payload: CashFlowPayload): Promise<void> {
      try {
        const message = await cashFlowApi.postCashFlow(payload);
        void showSuccessDialog(message);
        this.setIsCashFlowAdded(true);
      } catch (error: unknown) {
        void showErrorDialog(getErrorMessage(error, "Gagal menambahkan catatan arus kas"));
        this.setIsCashFlowAdded(false);
      } finally {
        this.setIsCashFlowAdd(true);
      }
    },
    async asyncChangeCashFlow(cashFlowId: string, payload: CashFlowPayload): Promise<void> {
      try {
        const message = await cashFlowApi.putCashFlow(cashFlowId, payload);
        void showSuccessDialog(message);
        this.setIsCashFlowChanged(true);
      } catch (error: unknown) {
        void showErrorDialog(getErrorMessage(error, "Gagal mengubah catatan arus kas"));
        this.setIsCashFlowChanged(false);
      } finally {
        this.setIsCashFlowChange(true);
      }
    },
    async asyncDeleteCashFlow(cashFlowId: string): Promise<void> {
      try {
        const message = await cashFlowApi.deleteCashFlow(cashFlowId);
        void showSuccessDialog(message);
        this.setIsCashFlowDeleted(true);
      } catch (error: unknown) {
        void showErrorDialog(getErrorMessage(error, "Gagal menghapus catatan arus kas"));
        this.setIsCashFlowDeleted(false);
      } finally {
        this.setIsCashFlowDelete(true);
      }
    },
    async asyncDeleteAllCashFlows(): Promise<void> {
      try {
        const message = await cashFlowApi.deleteAllCashFlows();
        void showSuccessDialog(message);
        this.setIsCashFlowDeletedAll(true);
      } catch (error: unknown) {
        void showErrorDialog(getErrorMessage(error, "Gagal mereset catatan arus kas"));
        this.setIsCashFlowDeletedAll(false);
      } finally {
        this.setIsCashFlowDeleteAll(true);
      }
    },
  },
});
