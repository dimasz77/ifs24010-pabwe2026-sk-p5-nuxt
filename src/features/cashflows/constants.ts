import type { CashFlowSource, CashFlowType } from "./api/cashFlowApi";

export const CASH_FLOW_TYPE_LABELS: Record<CashFlowType, string> = {
  inflow: "Pemasukan",
  outflow: "Pengeluaran",
};

export const CASH_FLOW_SOURCE_LABELS: Record<CashFlowSource, string> = {
  cash: "Tunai",
  savings: "Tabungan",
  loans: "Pinjaman",
};
