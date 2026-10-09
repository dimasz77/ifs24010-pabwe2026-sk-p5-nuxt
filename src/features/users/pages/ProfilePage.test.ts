import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMockPinia, renderWithProviders, mockUser } from "../../../test-utils";
import ProfilePage from "./ProfilePage.vue";
import * as toolsHelper from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  getErrorMessage: () => "error",
  secureUrl: (url: string | null | undefined) => url ?? "",
  resolvePhotoUrl: (url: string | null | undefined) => url ?? "",
}));

function setup(profile: typeof mockUser | null = mockUser) {
  const { pinia, usersStore } = createMockPinia({ profile });
  const view = renderWithProviders(ProfilePage, { pinia });
  return { ...view, usersStore };
}

function pickFile(wrapper: ReturnType<typeof setup>["wrapper"], files: unknown) {
  const input = wrapper.get('[data-testid="profile-photo-file-input"]');
  Object.defineProperty(input.element, "files", { value: files, configurable: true });
  return input.trigger("change");
}

function fileList(file: File): FileList {
  return Object.assign([file], { item: (index: number) => [file][index] ?? null }) as unknown as FileList;
}

describe("ProfilePage", () => {
  it("tidak merender apa pun jika profil belum ada, lalu mengisi form saat profil tersedia", async () => {
    const { wrapper, usersStore } = setup(null);
    expect(wrapper.find("h1").exists()).toBe(false);

    usersStore.setProfile(mockUser);
    await flushPromises();

    expect((wrapper.get('[data-testid="profile-name-input"]').element as HTMLInputElement).value).toBe("Budi Santoso");
    expect((wrapper.get('[data-testid="profile-email-input"]').element as HTMLInputElement).value).toBe("budi@del.ac.id");
  });

  it("mengosongkan watcher dengan aman saat profil kembali null", async () => {
    const { wrapper, usersStore } = setup();

    usersStore.setProfile(null);
    await flushPromises();

    expect(wrapper.find("h1").exists()).toBe(false);
  });

  it("menampilkan inisial atau foto profil", async () => {
    const { wrapper, usersStore } = setup();
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toContain("B");

    usersStore.setProfile({ ...mockUser, photo: "https://img.test/a.png" } as never);
    await flushPromises();

    expect(wrapper.get("img").attributes("alt")).toBe("Foto Budi Santoso");
  });

  describe("ubah biodata", () => {
    it("menolak nama atau email kosong", async () => {
      const { wrapper, usersStore } = setup();
      const putSpy = vi.spyOn(usersStore, "asyncPutProfile");

      await wrapper.get('[data-testid="profile-name-input"]').setValue("  ");
      await wrapper.findAll("form")[0]?.trigger("submit");

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Nama dan email tidak boleh kosong");
      expect(putSpy).not.toHaveBeenCalled();
    });

    it("menolak email kosong", async () => {
      const { wrapper } = setup();

      await wrapper.get('[data-testid="profile-email-input"]').setValue("");
      await wrapper.findAll("form")[0]?.trigger("submit");

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Nama dan email tidak boleh kosong");
    });

    it("menyimpan perubahan dan menampilkan status loading", async () => {
      const { wrapper, usersStore } = setup();
      let finish: () => void = () => undefined;
      const putSpy = vi.spyOn(usersStore, "asyncPutProfile").mockImplementation(
        () => new Promise<void>((resolve) => { finish = resolve; })
      );

      await wrapper.get('[data-testid="profile-name-input"]').setValue(" Budi Baru ");
      await wrapper.findAll("form")[0]?.trigger("submit");

      expect(putSpy).toHaveBeenCalledWith("Budi Baru", "budi@del.ac.id");
      expect(wrapper.get('[data-testid="submit-profile-btn"]').text()).toBe("Menyimpan Perubahan...");

      finish();
      await flushPromises();
      expect(wrapper.get('[data-testid="submit-profile-btn"]').text()).toBe("Simpan Perubahan");
    });
  });

  describe("unggah foto", () => {
    it("mengabaikan jika tidak ada berkas", async () => {
      const { wrapper, usersStore } = setup();
      const photoSpy = vi.spyOn(usersStore, "asyncPostProfilePhoto");

      await pickFile(wrapper, null);
      await pickFile(wrapper, Object.assign([], { item: () => null }));

      expect(photoSpy).not.toHaveBeenCalled();
    });

    it("menolak berkas bukan gambar", async () => {
      const { wrapper, usersStore } = setup();
      const photoSpy = vi.spyOn(usersStore, "asyncPostProfilePhoto");

      await pickFile(wrapper, fileList(new File(["x"], "a.pdf", { type: "application/pdf" })));

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Pilih file gambar yang valid");
      expect(photoSpy).not.toHaveBeenCalled();
    });

    it("menolak gambar yang lebih dari 3MB", async () => {
      const { wrapper, usersStore } = setup();
      const photoSpy = vi.spyOn(usersStore, "asyncPostProfilePhoto");
      const big = new File(["x"], "besar.png", { type: "image/png" });
      Object.defineProperty(big, "size", { value: 4 * 1024 * 1024 });

      await pickFile(wrapper, fileList(big));

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Ukuran file foto maksimal 3MB");
      expect(photoSpy).not.toHaveBeenCalled();
    });

    it("mengunggah gambar yang valid", async () => {
      const { wrapper, usersStore } = setup();
      const photoSpy = vi.spyOn(usersStore, "asyncPostProfilePhoto").mockImplementation(async () => {
        usersStore.setIsChangeProfilePhoto(true);
      });
      const file = new File(["x"], "ok.png", { type: "image/png" });

      await pickFile(wrapper, fileList(file));
      await flushPromises();

      expect(photoSpy).toHaveBeenCalledWith(file);
      expect(usersStore.isChangeProfilePhoto).toBe(false);
    });

    it("menampilkan ikon loading selama unggah", async () => {
      const { wrapper, usersStore } = setup();
      vi.spyOn(usersStore, "asyncPostProfilePhoto").mockImplementation(() => new Promise<void>(() => undefined));

      await pickFile(wrapper, fileList(new File(["x"], "ok.png", { type: "image/png" })));

      expect(wrapper.find('[data-testid="upload-profile-photo-btn"] .animate-spin').exists()).toBe(true);
    });
  });

  describe("ubah kata sandi", () => {
    async function fillPasswords(wrapper: ReturnType<typeof setup>["wrapper"], next: string, confirm: string) {
      await wrapper.get('[data-testid="current-password-input"]').setValue("lama");
      await wrapper.get('[data-testid="new-password-input"]').setValue(next);
      await wrapper.get('[data-testid="confirm-password-input"]').setValue(confirm);
      await wrapper.findAll("form")[1]?.trigger("submit");
      await flushPromises();
    }

    it("menolak kata sandi baru kurang dari 6 karakter", async () => {
      const { wrapper } = setup();

      await fillPasswords(wrapper, "abc", "abc");

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Kata sandi baru minimal 6 karakter");
    });

    it("menolak konfirmasi yang tidak cocok", async () => {
      const { wrapper } = setup();

      await fillPasswords(wrapper, "baru123", "baru999");

      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Konfirmasi kata sandi tidak cocok");
    });

    it("mengosongkan form setelah berhasil", async () => {
      const { wrapper, usersStore } = setup();
      const passwordSpy = vi.spyOn(usersStore, "asyncPutProfilePassword").mockImplementation(async () => {
        usersStore.setIsChangeProfilePassword(true);
      });

      await fillPasswords(wrapper, "baru123", "baru123");

      expect(passwordSpy).toHaveBeenCalledWith("lama", "baru123", "baru123");
      expect((wrapper.get('[data-testid="new-password-input"]').element as HTMLInputElement).value).toBe("");
      expect(usersStore.isChangeProfilePassword).toBe(false);
    });

    it("mempertahankan isian jika gagal dan menampilkan status loading saat proses", async () => {
      const { wrapper, usersStore } = setup();
      vi.spyOn(usersStore, "asyncPutProfilePassword").mockImplementation(async () => {
        usersStore.setIsChangeProfilePassword(false);
      });

      await fillPasswords(wrapper, "baru123", "baru123");
      expect((wrapper.get('[data-testid="new-password-input"]').element as HTMLInputElement).value).toBe("baru123");

      vi.spyOn(usersStore, "asyncPutProfilePassword").mockImplementation(() => new Promise<void>(() => undefined));
      await wrapper.findAll("form")[1]?.trigger("submit");
      expect(wrapper.get('[data-testid="submit-password-btn"]').text()).toBe("Memperbarui Kata Sandi...");
    });
  });
});