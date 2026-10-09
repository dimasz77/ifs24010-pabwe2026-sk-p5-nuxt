import { describe, it, expect } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { renderWithProviders } from "../../../test-utils";
import SidebarComponent from "./SidebarComponent.vue";

describe("SidebarComponent", () => {
  it("menampilkan tiga menu navigasi", () => {
    const { wrapper } = renderWithProviders(SidebarComponent, { props: { isSidebarOpen: false } });

    const links = wrapper.findAll("nav a");
    expect(links.map((link) => link.text())).toEqual([
      "Ringkasan Arus Kas",
      "Direktori Pengguna",
      "Profil Saya",
    ]);
  });

  it.each([
    ["/", "Ringkasan Arus Kas"],
    ["/cash-flows/cf-1", "Ringkasan Arus Kas"],
    ["/users", "Direktori Pengguna"],
    ["/profile", "Profil Saya"],
  ])("menandai menu aktif untuk rute %s", async (path, expectedLabel) => {
    const { wrapper, router } = renderWithProviders(SidebarComponent, { props: { isSidebarOpen: false } });

    await router.push(path);
    await flushPromises();

    const active = wrapper.findAll('a[aria-current="page"]');
    expect(active).toHaveLength(1);
    expect(active[0]?.text()).toBe(expectedLabel);
  });

  it("menyembunyikan sidebar di layar kecil saat tertutup", () => {
    const { wrapper } = renderWithProviders(SidebarComponent, { props: { isSidebarOpen: false } });

    expect(wrapper.get("aside").classes()).toContain("-translate-x-full");
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);
  });

  it("menampilkan backdrop saat terbuka dan menutup lewat klik backdrop", async () => {
    const { wrapper } = renderWithProviders(SidebarComponent, { props: { isSidebarOpen: true } });

    expect(wrapper.get("aside").classes()).toContain("translate-x-0");
    await wrapper.get('[data-testid="sidebar-backdrop"]').trigger("click");

    expect(wrapper.emitted("close-mobile")).toHaveLength(1);
  });

  it("menutup sidebar mobile saat sebuah menu diklik", async () => {
    const { wrapper } = renderWithProviders(SidebarComponent, { props: { isSidebarOpen: true } });

    await wrapper.findAll("nav a")[1]?.trigger("click");

    expect(wrapper.emitted("close-mobile")).toHaveLength(1);
  });
});
