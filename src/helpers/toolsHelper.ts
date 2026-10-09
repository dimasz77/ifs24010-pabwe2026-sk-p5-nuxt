import Swal, { type SweetAlertResult } from "sweetalert2";

export function showErrorDialog(message: string): Promise<SweetAlertResult> {
  return Swal.fire({
    title: "Terjadi Kesalahan",
    text: message,
    icon: "error",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#b91c1c",
  });
}

export function showWarningDialog(message: string): Promise<SweetAlertResult> {
  return Swal.fire({
    title: "Peringatan",
    text: message,
    icon: "warning",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#b45309",
  });
}

export function showSuccessDialog(message: string): Promise<SweetAlertResult> {
  return Swal.fire({
    title: "Tindakan Berhasil",
    text: message,
    icon: "success",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#047857",
  });
}

export function showConfirmDialog(message: string): Promise<SweetAlertResult> {
  return Swal.fire({
    title: "Konfirmasi",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Tidak",
    confirmButtonColor: "#4338ca",
    cancelButtonColor: "#475569",
  });
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function formatRupiah(value: number | string | null | undefined): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatDate(date: string | number | Date | null | undefined): string {
  if (!date) {
    return "-";
  }
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
