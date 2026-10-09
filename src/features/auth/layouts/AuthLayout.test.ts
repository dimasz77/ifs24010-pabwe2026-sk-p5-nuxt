import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory } from "vue-router";
import { createAppRouter } from "../../../router";
import { createMockPinia, renderWithProviders, mockUser } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";
import AuthLayout from "./AuthLayout.vue";

const stubs = { RouterView: { template: '<div data-testid="outlet" />' } };

async function setup(path = "/auth/login") {
  const { pinia, usersStore } = createMockPinia();
  const profileSpy = vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue();
  const router = createAppRouter(createMemoryHistory());
  await router.push(path);
  await router.isReady();
  const view = renderWithProviders(AuthLayout, { pinia, router, stubs });
  const pushSpy = vi.spyOn(router, "push");
  return { ...view, usersStore, profileSpy, pushSpy };
}

describe("AuthLayout", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("menampilkan judul aplikasi dan tempat render halaman anak", async () => {
    const { wrapper } = await setup();

    expect(wrapper.get("h1").text()).toBe("Delcom Cash Flow");
    expect(wrapper.find('[data-testid="outlet"]').exists()).toBe(true);
  });

  it("menandai tab Masuk aktif pada /auth/login", async () => {
    const { wrapper } = await setup("/auth/login");

    const [login, register] = wrapper.findAll("nav a");
    expect(login?.classes()).toContain("bg-white");
    expect(register?.classes()).not.toContain("bg-white");
  });

  it("menandai tab Daftar aktif pada /auth/register", async () => {
    const { wrapper } = await setup("/auth/register");

    const [login, register] = wrapper.findAll("nav a");
    expect(login?.classes()).not.toContain("bg-white");
    expect(register?.classes()).toContain("bg-white");
  });

  it("tidak memuat profil jika belum ada token", async () => {
    const { profileSpy } = await setup();

    expect(profileSpy).not.toHaveBeenCalled();
  });

  it("memuat profil jika token tersedia", async () => {
    apiHelper.putAccessToken("token");

    const { profileSpy } = await setup();

    expect(profileSpy).toHaveBeenCalledTimes(1);
  });

  it("mengarahkan ke beranda setelah profil berhasil dimuat", async () => {
    const { usersStore, pushSpy } = await setup();

    usersStore.setProfile(mockUser);
    usersStore.setIsProfile(true);
    await flushPromises();

    expect(pushSpy).toHaveBeenCalledWith("/");
    expect(usersStore.isProfile).toBe(false);
  });

  it("tidak mengarahkan jika profil gagal dimuat", async () => {
    const { usersStore, pushSpy } = await setup();

    usersStore.setProfile(null);
    usersStore.setIsProfile(true);
    await flushPromises();

    expect(pushSpy).not.toHaveBeenCalled();
    expect(usersStore.isProfile).toBe(false);
  });
});
