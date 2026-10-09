import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "./authStore";
import authApi from "../api/authApi";
import apiHelper from "../../../helpers/apiHelper";
import * as toolsHelper from "../../../helpers/toolsHelper";

vi.mock("../api/authApi");
vi.mock("../../../helpers/apiHelper", () => ({
  default: { putAccessToken: vi.fn() },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  getErrorMessage: (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback),
}));

describe("authStore", () => {
  let store: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAuthStore();
    vi.clearAllMocks();
  });

  it("memiliki state awal yang benar", () => {
    expect(store.$state).toEqual({
      isAuthRegister: false,
      isAuthRegistered: false,
      isAuthLogin: false,
      isAuthLoggedIn: false,
      isAuthLogout: false,
      isAuthLoggedOut: false,
    });
  });

  it("memperbarui state lewat setter", () => {
    store.setIsAuthRegister(true);
    store.setIsAuthRegistered(true);
    store.setIsAuthLogin(true);
    store.setIsAuthLoggedIn(true);
    store.setIsAuthLogout(true);
    store.setIsAuthLoggedOut(true);

    expect(Object.values(store.$state).every(Boolean)).toBe(true);
  });

  describe("asyncSetIsAuthRegister", () => {
    it("berhasil mendaftar dan menampilkan dialog sukses", async () => {
      vi.mocked(authApi.postRegister).mockResolvedValueOnce("Pendaftaran berhasil");

      await store.asyncSetIsAuthRegister("Budi", "budi@del.ac.id", "rahasia");

      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Pendaftaran berhasil");
      expect(store.isAuthRegistered).toBe(true);
      expect(store.isAuthRegister).toBe(true);
    });

    it("gagal mendaftar dan menampilkan dialog error", async () => {
      vi.mocked(authApi.postRegister).mockRejectedValueOnce(new Error("Email sudah terdaftar"));

      await store.asyncSetIsAuthRegister("Budi", "budi@del.ac.id", "rahasia");

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Email sudah terdaftar");
      expect(store.isAuthRegistered).toBe(false);
      expect(store.isAuthRegister).toBe(true);
    });
  });

  describe("asyncSetIsAuthLogin", () => {
    it("berhasil login dan menyimpan token", async () => {
      vi.mocked(authApi.postLogin).mockResolvedValueOnce({ token: "token-123" });

      await store.asyncSetIsAuthLogin("budi@del.ac.id", "rahasia");

      expect(apiHelper.putAccessToken).toHaveBeenCalledWith("token-123");
      expect(store.isAuthLoggedIn).toBe(true);
      expect(store.isAuthLogin).toBe(true);
    });

    it("gagal login dan menampilkan dialog error", async () => {
      vi.mocked(authApi.postLogin).mockRejectedValueOnce("bukan error");

      await store.asyncSetIsAuthLogin("budi@del.ac.id", "salah");

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal login");
      expect(store.isAuthLoggedIn).toBe(false);
      expect(store.isAuthLogin).toBe(true);
    });
  });

  describe("asyncSetIsAuthLogout", () => {
    it("logout dan membersihkan token", async () => {
      vi.mocked(authApi.postLogout).mockResolvedValueOnce("ok");

      await store.asyncSetIsAuthLogout();

      expect(apiHelper.putAccessToken).toHaveBeenCalledWith(null);
      expect(store.isAuthLoggedOut).toBe(true);
      expect(store.isAuthLogout).toBe(true);
    });

    it("tetap membersihkan token walau backend gagal", async () => {
      vi.mocked(authApi.postLogout).mockRejectedValueOnce(new Error("Server mati"));

      await store.asyncSetIsAuthLogout();

      expect(apiHelper.putAccessToken).toHaveBeenCalledWith(null);
      expect(store.isAuthLogout).toBe(true);
    });
  });
});
