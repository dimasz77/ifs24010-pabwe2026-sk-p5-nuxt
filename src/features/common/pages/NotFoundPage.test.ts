import { describe, it, expect, vi } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import NotFoundPage from "./NotFoundPage.vue";

describe("NotFoundPage", () => {
  it("menampilkan kode 404 dan pesan", () => {
    const { wrapper } = renderWithProviders(NotFoundPage);

    expect(wrapper.get("h1").text()).toBe("404");
    expect(wrapper.text()).toContain("Halaman Tidak Ditemukan");
  });

  it("kembali ke halaman sebelumnya", async () => {
    const { wrapper, router } = renderWithProviders(NotFoundPage);
    const goSpy = vi.spyOn(router, "go").mockImplementation(() => undefined);

    await wrapper.get('[data-testid="back-btn"]').trigger("click");

    expect(goSpy).toHaveBeenCalledWith(-1);
  });

  it("menuju halaman utama", async () => {
    const { wrapper, router } = renderWithProviders(NotFoundPage);
    const pushSpy = vi.spyOn(router, "push").mockResolvedValue(undefined);

    await wrapper.get('[data-testid="home-btn"]').trigger("click");

    expect(pushSpy).toHaveBeenCalledWith("/");
  });
});
