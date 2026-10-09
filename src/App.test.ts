import { describe, it, expect } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMemoryHistory } from "vue-router";
import { createAppRouter } from "./router";
import { renderWithProviders } from "./test-utils";
import App from "./App.vue";

describe("App (integrasi rute)", () => {
  it("menampilkan halaman login pada /auth/login", async () => {
    const router = createAppRouter(createMemoryHistory());
    const { wrapper } = renderWithProviders(App, { router });

    await router.push("/auth/login");
    await flushPromises();

    expect(wrapper.get("h1").text()).toBe("Delcom Cash Flow");
    expect(wrapper.find('[data-testid="login-submit-button"]').exists()).toBe(true);
  });

  it("menampilkan halaman registrasi pada /auth/register", async () => {
    const router = createAppRouter(createMemoryHistory());
    const { wrapper } = renderWithProviders(App, { router });

    await router.push("/auth/register");
    await flushPromises();

    expect(wrapper.find('[data-testid="register-submit-button"]').exists()).toBe(true);
  });

  it("menampilkan halaman 404 untuk rute yang tidak dikenal", async () => {
    const router = createAppRouter(createMemoryHistory());
    const { wrapper } = renderWithProviders(App, { router });

    await router.push("/halaman-tidak-ada");
    await flushPromises();

    expect(wrapper.get("h1").text()).toBe("404");
  });
});
