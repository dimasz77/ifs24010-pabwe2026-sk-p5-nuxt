import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory } from "vue-router";
import { createAppRouter } from "../../../router";
import { createMockPinia, renderWithProviders, mockUser } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";
import CashFlowLayout from "./CashFlowLayout.vue";

const stubs = { RouterView: { template: '<div data-testid="outlet" />' } };

function setup(profile: typeof mockUser | null = mockUser) {
  const { pinia, usersStore, authStore } = createMockPinia({ profile });
  const profileSpy = vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue();
  const logoutSpy = vi.spyOn(authStore, "asyncSetIsAuthLogout").mockResolvedValue();
  const router = createAppRouter(createMemoryHistory());
  const pushSpy = vi.spyOn(router, "push").mockResolvedValue(undefined);
  const view = renderWithProviders(CashFlowLayout, { pinia, router, stubs });
  return { ...view, usersStore, authStore, profileSpy, logoutSpy, pushSpy };
}

describe("CashFlowLayout", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("mengarahkan ke login jika tidak ada token dan menampilkan status memuat", () => {
    const { wrapper, pushSpy, profileSpy } = setup(null);

    expect(pushSpy).toHaveBeenCalledWith("/auth/login");
    expect(profileSpy).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Memuat sesi pengguna...");
  });

  it("memuat profil jika token tersedia", () => {
    apiHelper.putAccessToken("token");

    const { profileSpy, pushSpy } = setup(null);

    expect(profileSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("menampilkan navbar, sidebar, dan konten utama saat profil tersedia", () => {
    const { wrapper } = setup();

    expect(wrapper.find("header").exists()).toBe(true);
    expect(wrapper.find("aside").exists()).toBe(true);
    expect(wrapper.find("main").exists()).toBe(true);
    expect(wrapper.find('[data-testid="outlet"]').exists()).toBe(true);
  });

  it("membuka dan menutup sidebar mobile", async () => {
    const { wrapper } = setup();

    await wrapper.get('[data-testid="toggle-sidebar-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(true);

    await wrapper.get('[data-testid="sidebar-backdrop"]').trigger("click");
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);
  });

  it("menghapus token dan kembali ke login jika profil gagal dimuat", async () => {
    apiHelper.putAccessToken("token");
    const { usersStore, pushSpy } = setup(null);

    usersStore.setIsProfile(true);
    await flushPromises();

    expect(apiHelper.getAccessToken()).toBeNull();
    expect(pushSpy).toHaveBeenCalledWith("/auth/login");
    expect(usersStore.isProfile).toBe(false);
  });

  it("tetap di halaman jika profil berhasil dimuat", async () => {
    apiHelper.putAccessToken("token");
    const { usersStore, pushSpy } = setup();

    usersStore.setIsProfile(true);
    await flushPromises();

    expect(apiHelper.getAccessToken()).toBe("token");
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("menjalankan logout dan kembali ke login setelah selesai", async () => {
    const { wrapper, authStore, usersStore, logoutSpy, pushSpy } = setup();

    await wrapper.get('[data-testid="logout-button"]').trigger("click");
    expect(logoutSpy).toHaveBeenCalledTimes(1);

    authStore.setIsAuthLogout(true);
    await flushPromises();

    expect(authStore.isAuthLogout).toBe(false);
    expect(usersStore.profile).toBeNull();
    expect(pushSpy).toHaveBeenCalledWith("/auth/login");
  });
});
