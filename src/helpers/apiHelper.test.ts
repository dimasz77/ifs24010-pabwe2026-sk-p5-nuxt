import { describe, it, expect, beforeEach, vi } from "vitest";
import apiHelper from "./apiHelper";
import { mockJsonResponse } from "../test-utils";

describe("apiHelper", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("token storage", () => {
    it("menyimpan, membaca, dan menghapus token", () => {
      expect(apiHelper.getAccessToken()).toBeNull();
      apiHelper.putAccessToken("dummy-token");
      expect(apiHelper.getAccessToken()).toBe("dummy-token");
      apiHelper.putAccessToken(null);
      expect(apiHelper.getAccessToken()).toBeNull();
      apiHelper.putAccessToken("dummy-token");
      apiHelper.putAccessToken("");
      expect(apiHelper.getAccessToken()).toBeNull();
    });
  });

  describe("fetchData", () => {
    it("menambahkan header Authorization dan menghapus trailing slash", async () => {
      apiHelper.putAccessToken("test-token");
      const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
      vi.stubGlobal("fetch", mockFetch);

      await apiHelper.fetchData("http://localhost/api/v1/users/", { method: "GET" });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost/api/v1/users",
        expect.objectContaining({
          method: "GET",
          mode: "cors",
          headers: { Authorization: "Bearer test-token" },
        })
      );
    });

    it("mempertahankan query string dan header bawaan tanpa token", async () => {
      const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
      vi.stubGlobal("fetch", mockFetch);

      await apiHelper.fetchData("http://localhost/api/v1/cash-flows/?type=inflow", {
        headers: { "Content-Type": "application/json" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost/api/v1/cash-flows?type=inflow",
        expect.objectContaining({ headers: { "Content-Type": "application/json" } })
      );
    });

    it("bekerja tanpa options dan tanpa trailing slash", async () => {
      const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
      vi.stubGlobal("fetch", mockFetch);

      await apiHelper.fetchData("http://localhost/api/v1/users");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost/api/v1/users",
        expect.objectContaining({ headers: {} })
      );
    });
  });

  describe("fetchJson", () => {
    it("mengembalikan envelope jika status success", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({ status: "success", message: "OK", data: { a: 1 } })));

      const result = await apiHelper.fetchJson<{ a: number }>("http://localhost/x");

      expect(result.data.a).toBe(1);
    });

    it("menerima respons dengan flag success true", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({ success: true, message: "OK", data: null })));

      const result = await apiHelper.fetchJson("http://localhost/x");

      expect(result.message).toBe("OK");
    });

    it("melempar pesan dari server beserta detail validasi", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          mockJsonResponse({ status: "fail", message: "Validasi gagal", data: { email: ["Email tidak valid"], name: ["Nama kosong"] } })
        )
      );

      await expect(apiHelper.fetchJson("http://localhost/x")).rejects.toThrow(
        "Validasi gagal: Email tidak valid, Nama kosong"
      );
    });

    it("memakai pesan fallback bawaan jika server tidak mengirim pesan", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({ status: "fail", data: null })));

      await expect(apiHelper.fetchJson("http://localhost/x")).rejects.toThrow("Terjadi kesalahan pada server");
    });

    it("memakai pesan fallback khusus dan mengabaikan data non-objek", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({ status: "fail", data: "teks" })));

      await expect(apiHelper.fetchJson("http://localhost/x", {}, "Gagal khusus")).rejects.toThrow("Gagal khusus");
    });

    it("melempar fallback jika respons bukan JSON", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          json: async () => {
            throw new SyntaxError("Unexpected token");
          },
        })
      );

      await expect(apiHelper.fetchJson("http://localhost/x", {}, "Respons tidak valid")).rejects.toThrow("Respons tidak valid");
    });
  });
});
