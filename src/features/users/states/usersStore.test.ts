import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useUsersStore } from "./usersStore";
import userApi from "../api/userApi";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { mockUser } from "../../../test-utils";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", () => ({
  showSuccessDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  getErrorMessage: (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback),
}));

describe("usersStore", () => {
  let store: ReturnType<typeof useUsersStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useUsersStore();
    vi.clearAllMocks();
  });

  it("memiliki state awal yang benar", () => {
    expect(store.users).toEqual([]);
    expect(store.profile).toBeNull();
    expect(store.isProfile).toBe(false);
  });

  it("memperbarui state lewat setter", () => {
    store.setUsers([mockUser]);
    store.setProfile(mockUser);
    store.setIsProfile(true);
    store.setIsChangeProfile(true);
    store.setIsChangeProfilePhoto(true);
    store.setIsChangeProfilePassword(true);

    expect(store.users).toEqual([mockUser]);
    expect(store.profile).toEqual(mockUser);
    expect([store.isProfile, store.isChangeProfile, store.isChangeProfilePhoto, store.isChangeProfilePassword]).toEqual([true, true, true, true]);
  });

  it("asyncSetUsers mengisi daftar pengguna, atau mengosongkannya saat gagal", async () => {
    vi.mocked(userApi.getUsers).mockResolvedValueOnce([mockUser]);
    await store.asyncSetUsers();
    expect(store.users).toEqual([mockUser]);

    vi.mocked(userApi.getUsers).mockRejectedValueOnce(new Error("gagal"));
    await store.asyncSetUsers();
    expect(store.users).toEqual([]);
  });

  it("asyncSetProfile mengisi profil, atau null saat gagal", async () => {
    vi.mocked(userApi.getProfile).mockResolvedValueOnce(mockUser);
    await store.asyncSetProfile();
    expect(store.profile).toEqual(mockUser);
    expect(store.isProfile).toBe(true);

    vi.mocked(userApi.getProfile).mockRejectedValueOnce(new Error("gagal"));
    await store.asyncSetProfile();
    expect(store.profile).toBeNull();
  });

  describe("asyncPutProfile", () => {
    it("memperbarui profil dan menampilkan dialog sukses", async () => {
      vi.mocked(userApi.putProfile).mockResolvedValueOnce("Profil diubah");
      vi.mocked(userApi.getProfile).mockResolvedValueOnce({ ...mockUser, name: "Baru" });

      await store.asyncPutProfile("Baru", mockUser.email);

      expect(store.profile?.name).toBe("Baru");
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Profil diubah");
      expect(store.isChangeProfile).toBe(true);
    });

    it("menampilkan dialog error saat gagal", async () => {
      vi.mocked(userApi.putProfile).mockRejectedValueOnce(new Error("Email dipakai"));

      await store.asyncPutProfile("Baru", "x@y.z");

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Email dipakai");
      expect(store.isChangeProfile).toBe(false);
    });
  });

  describe("asyncPostProfilePhoto", () => {
    it("mengunggah foto dan memuat ulang profil", async () => {
      vi.mocked(userApi.postProfilePhoto).mockResolvedValueOnce("Foto diubah");
      vi.mocked(userApi.getProfile).mockResolvedValueOnce(mockUser);

      await store.asyncPostProfilePhoto(new File(["x"], "a.png"));

      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Foto diubah");
      expect(store.profile).toEqual(mockUser);
      expect(store.isChangeProfilePhoto).toBe(true);
    });

    it("menampilkan dialog error saat gagal", async () => {
      vi.mocked(userApi.postProfilePhoto).mockRejectedValueOnce("bukan error");

      await store.asyncPostProfilePhoto(new File(["x"], "a.png"));

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Gagal mengubah foto profil");
      expect(store.isChangeProfilePhoto).toBe(false);
    });
  });

  describe("asyncPutProfilePassword", () => {
    it("mengubah kata sandi dengan sukses", async () => {
      vi.mocked(userApi.putProfilePassword).mockResolvedValueOnce("Sandi diubah");

      await store.asyncPutProfilePassword("lama", "baru123", "baru123");

      expect(userApi.putProfilePassword).toHaveBeenCalledWith("lama", "baru123", "baru123");
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith("Sandi diubah");
      expect(store.isChangeProfilePassword).toBe(true);
    });

    it("menampilkan dialog error saat gagal", async () => {
      vi.mocked(userApi.putProfilePassword).mockRejectedValueOnce(new Error("Sandi lama salah"));

      await store.asyncPutProfilePassword("x", "y", "y");

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Sandi lama salah");
      expect(store.isChangeProfilePassword).toBe(false);
    });
  });
});
