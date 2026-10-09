import { describe, it, expect, vi, beforeEach } from "vitest";
import authApi from "./authApi";
import { mockJsonResponse } from "../../../test-utils";

const BASE = "https://open-api.delcom.org/api/v1/auth";

describe("authApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("postRegister mengirim data dan mengembalikan pesan", async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockJsonResponse({ success: true, message: "Registrasi berhasil" }));
    vi.stubGlobal("fetch", mockFetch);

    const message = await authApi.postRegister("Budi", "budi@del.ac.id", "rahasia");

    expect(message).toBe("Registrasi berhasil");
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE}/register`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Budi", email: "budi@del.ac.id", password: "rahasia" }),
      })
    );
  });

  it("postRegister memberi string kosong jika server tidak mengirim pesan", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({ success: true })));

    expect(await authApi.postRegister("a", "b", "c")).toBe("");
  });

  it("postRegister melempar error dari server", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({ success: false, message: "Email sudah terdaftar", data: null })));

    await expect(authApi.postRegister("a", "b", "c")).rejects.toThrow("Email sudah terdaftar");
  });

  it("postLogin mengembalikan data token", async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockJsonResponse({ success: true, data: { token: "abc123" } }));
    vi.stubGlobal("fetch", mockFetch);

    const data = await authApi.postLogin("budi@del.ac.id", "rahasia");

    expect(data.token).toBe("abc123");
    expect(mockFetch).toHaveBeenCalledWith(`${BASE}/login`, expect.objectContaining({ method: "POST" }));
  });

  it("postLogin melempar error jika kredensial salah", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({ success: false, message: "Kredensial salah", data: null })));

    await expect(authApi.postLogin("a", "b")).rejects.toThrow("Kredensial salah");
  });

  it("postLogout mengembalikan pesan dan memakai token", async () => {
    localStorage.setItem("accessToken", "tok");
    const mockFetch = vi.fn().mockResolvedValue(mockJsonResponse({ success: true, message: "Logout berhasil" }));
    vi.stubGlobal("fetch", mockFetch);

    expect(await authApi.postLogout()).toBe("Logout berhasil");
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE}/logout`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer tok" }) })
    );
  });

  it("postLogout memberi string kosong jika tanpa pesan dan melempar saat gagal", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(mockJsonResponse({ success: true })));
    expect(await authApi.postLogout()).toBe("");

    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(mockJsonResponse({ success: false, data: null })));
    await expect(authApi.postLogout()).rejects.toThrow("Gagal logout");
  });
});
