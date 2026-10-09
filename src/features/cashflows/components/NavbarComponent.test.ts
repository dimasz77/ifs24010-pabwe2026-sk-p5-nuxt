import { describe, it, expect } from "vitest";
import { renderWithProviders, mockUser } from "../../../test-utils";
import NavbarComponent from "./NavbarComponent.vue";

describe("NavbarComponent", () => {
  it("menampilkan nama, email, inisial, dan status sesi", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: { profile: mockUser, isSidebarOpen: false },
    });

    expect(wrapper.get('[data-testid="navbar-name"]').text()).toBe("Budi Santoso");
    expect(wrapper.get('[data-testid="navbar-email"]').text()).toBe("budi@del.ac.id");
    expect(wrapper.text()).toContain("B");
    expect(wrapper.text()).toContain("Sesi aktif");
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("menampilkan foto profil jika tersedia", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: { profile: { ...mockUser, photo: "https://img.test/a.png" }, isSidebarOpen: false },
    });

    const img = wrapper.get("img");
    expect(img.attributes("src")).toBe("https://img.test/a.png");
    expect(img.attributes("alt")).toBe("Foto Budi Santoso");
  });

  it("memancarkan toggle-sidebar dan mengubah label tombol sesuai status", async () => {
    const closed = renderWithProviders(NavbarComponent, { props: { profile: mockUser, isSidebarOpen: false } });
    const toggle = closed.wrapper.get('[data-testid="toggle-sidebar-btn"]');
    expect(toggle.attributes("aria-label")).toBe("Buka navigasi");
    expect(toggle.attributes("aria-expanded")).toBe("false");

    await toggle.trigger("click");
    expect(closed.wrapper.emitted("toggle-sidebar")).toHaveLength(1);

    const open = renderWithProviders(NavbarComponent, { props: { profile: mockUser, isSidebarOpen: true } });
    const openToggle = open.wrapper.get('[data-testid="toggle-sidebar-btn"]');
    expect(openToggle.attributes("aria-label")).toBe("Tutup navigasi");
    expect(openToggle.attributes("aria-expanded")).toBe("true");
  });

  it("memancarkan logout saat tombol keluar diklik", async () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: { profile: mockUser, isSidebarOpen: false },
    });

    await wrapper.get('[data-testid="logout-button"]').trigger("click");

    expect(wrapper.emitted("logout")).toHaveLength(1);
  });
});
