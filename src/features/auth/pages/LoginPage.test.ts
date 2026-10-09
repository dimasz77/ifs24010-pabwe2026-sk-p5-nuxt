import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMockPinia, renderWithProviders } from "../../../test-utils";
import LoginPage from "./LoginPage.vue";

function setup() {
  const { pinia, authStore, usersStore } = createMockPinia();
  const profileSpy = vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue();
  const view = renderWithProviders(LoginPage, { pinia });
  return { ...view, authStore, usersStore, profileSpy };
}

async function submitForm(wrapper: ReturnType<typeof setup>["wrapper"]): Promise<void> {
  await wrapper.get('[data-testid="login-email-input"]').setValue("budi@del.ac.id");
  await wrapper.get('[data-testid="login-password-input"]').setValue("rahasia");
  await wrapper.get("form").trigger("submit");
}

describe("LoginPage", () => {
  it("merender input berlabel dan tombol masuk", () => {
    const { wrapper } = setup();

    expect(wrapper.get('label[for="login-email-input"]').text()).toContain("Alamat Email");
    expect(wrapper.get('label[for="login-password-input"]').text()).toContain("Kata Sandi");
    expect(wrapper.get('[data-testid="login-submit-button"]').text()).toBe("Masuk Sekarang");
  });

  it("memuat profil setelah login berhasil", async () => {
    const { wrapper, authStore, profileSpy } = setup();
    const loginSpy = vi.spyOn(authStore, "asyncSetIsAuthLogin").mockImplementation(async () => {
      authStore.setIsAuthLoggedIn(true);
      authStore.setIsAuthLogin(true);
    });

    await submitForm(wrapper);
    await flushPromises();

    expect(loginSpy).toHaveBeenCalledWith("budi@del.ac.id", "rahasia");
    expect(profileSpy).toHaveBeenCalledTimes(1);
    expect(authStore.isAuthLogin).toBe(false);
    expect(authStore.isAuthLoggedIn).toBe(false);
    expect(wrapper.get('[data-testid="login-submit-button"]').attributes("disabled")).toBeUndefined();
  });

  it("tidak memuat profil jika login gagal", async () => {
    const { wrapper, authStore, profileSpy } = setup();
    vi.spyOn(authStore, "asyncSetIsAuthLogin").mockImplementation(async () => {
      authStore.setIsAuthLoggedIn(false);
      authStore.setIsAuthLogin(true);
    });

    await submitForm(wrapper);
    await flushPromises();

    expect(profileSpy).not.toHaveBeenCalled();
    expect(authStore.isAuthLogin).toBe(false);
  });

  it("menampilkan status loading selama proses login", async () => {
    const { wrapper, authStore } = setup();
    let finish: () => void = () => undefined;
    vi.spyOn(authStore, "asyncSetIsAuthLogin").mockImplementation(
      () => new Promise<void>((resolve) => { finish = resolve; })
    );

    await submitForm(wrapper);

    const button = wrapper.get('[data-testid="login-submit-button"]');
    expect(button.text()).toBe("Sedang Masuk...");
    expect(button.attributes("disabled")).toBeDefined();

    finish();
    await flushPromises();
    expect(button.text()).toBe("Masuk Sekarang");
  });
});
