import { describe, it, expect, vi, beforeEach } from "vitest";
import userApi from "./userApi";
import { mockJsonResponse, mockUser } from "../../../test-utils";

const BASE = "https://open-api.delcom.org/api/v1/users";

describe("userApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("getUsers mengembalikan daftar pengguna", async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockJsonResponse({ success: true, data: { users: [mockUser] } }));
    vi.stubGlobal("fetch", mockFetch);

    expect(await userApi.getUsers()).toEqual([mockUser]);
    expect(mockFetch).toHaveBeenCalledWith(BASE, expect.objectContaining({ method: "GET" }));
  });

  it("getUsers mengembalikan array kosong jika data tidak ada", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({ success: true, data: {} })));

    expect(await userApi.getUsers()).toEqual([]);
  });

  it("getUsers melempar error saat gagal", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({ success: false, message: "Tidak berwenang", data: null })));

    await expect(userApi.getUsers()).rejects.toThrow("Tidak berwenang");
  });

  it("getProfile mengembalikan profil aktif", async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockJsonResponse({ success: true, data: { user: mockUser } }));
    vi.stubGlobal("fetch", mockFetch);

    expect(await userApi.getProfile()).toEqual(mockUser);
    expect(mockFetch).toHaveBeenCalledWith(`${BASE}/me`, expect.anything());
  });

  it("putProfile mengirim nama dan email", async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockJsonResponse({ success: true, message: "Profil diubah" }));
    vi.stubGlobal("fetch", mockFetch);

    expect(await userApi.putProfile("Budi", "budi@del.ac.id")).toBe("Profil diubah");
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE}/me`,
      expect.objectContaining({ method: "PUT", body: JSON.stringify({ name: "Budi", email: "budi@del.ac.id" }) })
    );
  });

  it("putProfile memberi string kosong jika tanpa pesan", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({ success: true })));

    expect(await userApi.putProfile("a", "b")).toBe("");
  });

  it("postProfilePhoto mengunggah berkas sebagai FormData", async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockJsonResponse({ success: true, message: "Foto diubah" }));
    vi.stubGlobal("fetch", mockFetch);
    const file = new File(["x"], "foto.png", { type: "image/png" });

    expect(await userApi.postProfilePhoto(file)).toBe("Foto diubah");

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE}/me/photo`);
    expect(options.body).toBeInstanceOf(FormData);
    expect((options.body as FormData).get("photo")).toBeInstanceOf(File);
  });

  it("postProfilePhoto memberi string kosong jika tanpa pesan", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({ success: true })));

    expect(await userApi.postProfilePhoto(new File(["x"], "a.png"))).toBe("");
  });

  it("putProfilePassword mengirim kata sandi lama, baru, dan konfirmasi", async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockJsonResponse({ success: true, message: "Sandi diubah" }));
    vi.stubGlobal("fetch", mockFetch);

    expect(await userApi.putProfilePassword("lama", "baru123", "baru123")).toBe("Sandi diubah");
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE}/password`,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ password: "lama", new_password: "baru123", new_password_confirmation: "baru123" }),
      })
    );
  });

  it("putProfilePassword memberi string kosong jika tanpa pesan", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockJsonResponse({ success: true })));

    expect(await userApi.putProfilePassword("a", "b", "b")).toBe("");
  });
});
