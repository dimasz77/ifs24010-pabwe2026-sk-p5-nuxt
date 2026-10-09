import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { createMockPinia, renderWithProviders, mockUser } from "../../../test-utils";
import UsersPage from "./UsersPage.vue";

const siti = { ...mockUser, id: "user-2", name: "Siti Aminah", email: "siti@del.ac.id", photo: "https://img.test/siti.png" };

function setup(users = [mockUser, siti], fetchImpl?: () => Promise<void>) {
  const { pinia, usersStore } = createMockPinia({ users });
  const fetchSpy = vi.spyOn(usersStore, "asyncSetUsers").mockImplementation(fetchImpl ?? (async () => undefined));
  const view = renderWithProviders(UsersPage, { pinia });
  return { ...view, usersStore, fetchSpy };
}

describe("UsersPage", () => {
  it("memuat pengguna saat dimuat dan menampilkan kartu pengguna", async () => {
    const { wrapper, fetchSpy } = setup();
    await flushPromises();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(wrapper.get("h1").text()).toBe("Direktori Pengguna");
    expect(wrapper.find('[data-testid="user-card-user-1"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="users-total"]').text()).toBe("Total: 2 Pengguna");
  });

  it("menampilkan inisial jika tanpa foto dan foto jika tersedia", async () => {
    const { wrapper } = setup();
    await flushPromises();

    expect(wrapper.get('[data-testid="user-card-user-1"]').text()).toContain("B");
    expect(wrapper.find('[data-testid="user-card-user-1"] img').exists()).toBe(false);
    expect(wrapper.get('[data-testid="user-card-user-2"] img').attributes("alt")).toBe("Foto Siti Aminah");
  });

  it("menampilkan status loading selama pengguna dimuat", async () => {
    const { wrapper } = setup([], () => new Promise<void>(() => undefined));
    await flushPromises();

    expect(wrapper.text()).toContain("Memuat daftar pengguna...");
  });

  it("memfilter pengguna berdasarkan nama atau email", async () => {
    const { wrapper } = setup();
    await flushPromises();
    const search = wrapper.get('[data-testid="search-user-input"]');

    await search.setValue("siti");
    expect(wrapper.findAll("article")).toHaveLength(1);

    await search.setValue("BUDI@DEL");
    expect(wrapper.findAll("article")).toHaveLength(1);
    expect(wrapper.get("article").text()).toContain("Budi Santoso");
  });

  it("menampilkan pesan kosong jika tidak ada hasil", async () => {
    const { wrapper } = setup();
    await flushPromises();

    await wrapper.get('[data-testid="search-user-input"]').setValue("tidak ada");

    expect(wrapper.text()).toContain("Tidak ada data pengguna ditemukan.");
  });
});
