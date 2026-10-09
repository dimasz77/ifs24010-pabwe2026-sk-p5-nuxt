import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMockPinia, renderWithProviders } from "../../../test-utils";
import RegisterPage from "./RegisterPage.vue";
import * as toolsHelper from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  getErrorMessage: () => "error",
}));

function setup() {
  const { pinia, authStore } = createMockPinia();
  const view = renderWithProviders(RegisterPage, { pinia });
  const pushSpy = vi.spyOn(view.router, "push").mockResolvedValue(undefined);
  return { ...view, authStore, pushSpy };
}

async function fillForm(wrapper: ReturnType<typeof setup>["wrapper"], confirm: string): Promise<void> {
  await wrapper.get('[data-testid="register-name-input"]').setValue("  Budi  ");
  await wrapper.get('[data-testid="register-email-input"]').setValue(" budi@del.ac.id ");
  await wrapper.get('[data-testid="register-password-input"]').setValue("rahasia");
  await wrapper.get('[data-testid="register-confirm-input"]').setValue(confirm);
  await wrapper.get("form").trigger("submit");
  await flushPromises();
}

describe("RegisterPage", () => {
  it("merender seluruh input berlabel", () => {
    const { wrapper } = setup();

    ["name", "email", "password", "confirm"].forEach((field) => {
      expect(wrapper.find(`label[for="register-${field}-input"]`).exists()).toBe(true);
    });
  });

  it("menolak konfirmasi kata sandi yang tidak cocok", async () => {
    const { wrapper, authStore } = setup();
    const registerSpy = vi.spyOn(authStore, "asyncSetIsAuthRegister");

    await fillForm(wrapper, "berbeda");

    expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith("Konfirmasi kata sandi tidak cocok");
    expect(registerSpy).not.toHaveBeenCalled();
  });

  it("mengarahkan ke halaman login setelah registrasi berhasil", async () => {
    const { wrapper, authStore, pushSpy } = setup();
    const registerSpy = vi.spyOn(authStore, "asyncSetIsAuthRegister").mockImplementation(async () => {
      authStore.setIsAuthRegistered(true);
      authStore.setIsAuthRegister(true);
    });

    await fillForm(wrapper, "rahasia");

    expect(registerSpy).toHaveBeenCalledWith("Budi", "budi@del.ac.id", "rahasia");
    expect(pushSpy).toHaveBeenCalledWith("/auth/login");
    expect(authStore.isAuthRegister).toBe(false);
    expect(authStore.isAuthRegistered).toBe(false);
  });

  it("tetap di halaman jika registrasi gagal", async () => {
    const { wrapper, authStore, pushSpy } = setup();
    vi.spyOn(authStore, "asyncSetIsAuthRegister").mockImplementation(async () => {
      authStore.setIsAuthRegistered(false);
      authStore.setIsAuthRegister(true);
    });

    await fillForm(wrapper, "rahasia");

    expect(pushSpy).not.toHaveBeenCalled();
    expect(wrapper.get('[data-testid="register-submit-button"]').text()).toBe("Daftar Sekarang");
  });

  it("menampilkan status loading selama proses registrasi", async () => {
    const { wrapper, authStore } = setup();
    vi.spyOn(authStore, "asyncSetIsAuthRegister").mockImplementation(() => new Promise<void>(() => undefined));

    await wrapper.get('[data-testid="register-password-input"]').setValue("rahasia");
    await wrapper.get('[data-testid="register-confirm-input"]').setValue("rahasia");
    await wrapper.get("form").trigger("submit");

    const button = wrapper.get('[data-testid="register-submit-button"]');
    expect(button.text()).toBe("Mendaftarkan...");
    expect(button.attributes("disabled")).toBeDefined();
  });
});
