import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import {
  formatDate,
  formatRupiah,
  getErrorMessage,
  resolvePhotoUrl,
  secureUrl,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn() },
}));

describe("toolsHelper", () => {
  beforeEach(() => {
    vi.mocked(Swal.fire).mockReset();
    vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as never);
  });

  it.each([
    ["showErrorDialog", showErrorDialog, "error"],
    ["showWarningDialog", showWarningDialog, "warning"],
    ["showSuccessDialog", showSuccessDialog, "success"],
  ])("%s menampilkan dialog dengan ikon yang sesuai", async (_name, dialog, icon) => {
    const result = await dialog("Pesan uji");

    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Pesan uji", icon }));
    expect(result.isConfirmed).toBe(true);
  });

  it("showConfirmDialog menampilkan tombol batal", async () => {
    await showConfirmDialog("Yakin?");

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ text: "Yakin?", icon: "question", showCancelButton: true })
    );
  });

  describe("getErrorMessage", () => {
    it("memakai pesan dari Error", () => {
      expect(getErrorMessage(new Error("Gagal"), "Fallback")).toBe("Gagal");
    });

    it("memakai fallback untuk Error tanpa pesan", () => {
      expect(getErrorMessage(new Error(""), "Fallback")).toBe("Fallback");
    });

    it("memakai fallback untuk nilai selain Error", () => {
      expect(getErrorMessage("teks", "Fallback")).toBe("Fallback");
    });
  });

  describe("resolvePhotoUrl", () => {
    it("mengembalikan string kosong untuk nilai kosong", () => {
      expect(resolvePhotoUrl(null)).toBe("");
      expect(resolvePhotoUrl(undefined)).toBe("");
      expect(resolvePhotoUrl("")).toBe("");
    });

    it("membiarkan url https dan mengubah http menjadi https", () => {
      expect(resolvePhotoUrl("https://a.test/x.png")).toBe("https://a.test/x.png");
      expect(resolvePhotoUrl("http://a.test/x.png")).toBe("https://a.test/x.png");
    });

    it("melengkapi path relatif dengan origin Delcom", () => {
      expect(resolvePhotoUrl("img/profile/a.png")).toBe(`${DELCOM_ORIGIN}/img/profile/a.png`);
      expect(resolvePhotoUrl("/img/profile/a.png")).toBe(`${DELCOM_ORIGIN}/img/profile/a.png`);
    });

    it("secureUrl adalah alias resolvePhotoUrl", () => {
      expect(secureUrl("img/a.png")).toBe(resolvePhotoUrl("img/a.png"));
    });
  });

  describe("formatRupiah", () => {
    it("memformat angka dan string numerik", () => {
      expect(formatRupiah(1500000)).toMatch(/^Rp\s?1\.500\.000$/);
      expect(formatRupiah("25000")).toMatch(/^Rp\s?25\.000$/);
    });

    it("menganggap nilai kosong atau tidak valid sebagai nol", () => {
      expect(formatRupiah(null)).toMatch(/^Rp\s?0$/);
      expect(formatRupiah(undefined)).toMatch(/^Rp\s?0$/);
      expect(formatRupiah("abc")).toMatch(/^Rp\s?0$/);
    });
  });

  describe("formatDate", () => {
    it("mengembalikan tanda hubung untuk nilai kosong", () => {
      expect(formatDate(null)).toBe("-");
      expect(formatDate(undefined)).toBe("-");
    });

    it("memformat tanggal valid dalam bahasa Indonesia", () => {
      const result = formatDate("2026-01-15T10:30:00.000Z");

      expect(result).toContain("Januari");
      expect(result).toContain("2026");
    });
  });
});