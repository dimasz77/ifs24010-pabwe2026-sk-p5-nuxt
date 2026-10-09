import type { SweetAlertResult } from "sweetalert2";

// SweetAlert2 dimuat secara lazy: hanya diunduh saat dialog pertama kali dibutuhkan.
async function loadSwal() {
  return (await import("sweetalert2")).default;
}

export async function showErrorDialog(message: string): Promise<SweetAlertResult> {
  const Swal = await loadSwal();
  return Swal.fire({
    title: "Terjadi Kesalahan",
    text: message,
    icon: "error",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#b91c1c",
  });
}

export async function showWarningDialog(message: string): Promise<SweetAlertResult> {
  const Swal = await loadSwal();
  return Swal.fire({
    title: "Peringatan",
    text: message,
    icon: "warning",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#b45309",
  });
}

export async function showSuccessDialog(message: string): Promise<SweetAlertResult> {
  const Swal = await loadSwal();
  return Swal.fire({
    title: "Tindakan Berhasil",
    text: message,
    icon: "success",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#047857",
  });
}

export async function showConfirmDialog(message: string): Promise<SweetAlertResult> {
  const Swal = await loadSwal();
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

/**
 * Foto profil dari API bisa berupa URL penuh atau path relatif (img/profile/...).
 * Path relatif dilengkapi dengan origin Delcom; http diubah menjadi https.
 */
export function resolvePhotoUrl(photo: string | null | undefined): string {
  if (!photo) {
    return "";
  }
  if (/^https?:\/\//i.test(photo)) {
    return photo.replace(/^http:\/\//i, "https://");
  }
  return `${DELCOM_ORIGIN}/${photo.replace(/^\/+/, "")}`;
}

export const secureUrl = resolvePhotoUrl;

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