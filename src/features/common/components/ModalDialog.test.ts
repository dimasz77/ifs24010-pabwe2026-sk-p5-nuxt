import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ModalDialog from "./ModalDialog.vue";

function mountModal() {
  return mount(ModalDialog, {
    props: { title: "Judul Modal", testId: "uji-modal" },
    slots: { default: "<p>Isi modal</p>" },
    attachTo: document.body,
  });
}

describe("ModalDialog", () => {
  it("merender dialog yang aksesibel dengan judul dan isi", () => {
    const wrapper = mountModal();

    const dialog = wrapper.get('[data-testid="uji-modal"]');
    expect(dialog.attributes("role")).toBe("dialog");
    expect(dialog.attributes("aria-modal")).toBe("true");
    expect(dialog.attributes("aria-labelledby")).toBe("uji-modal-title");
    expect(wrapper.get("#uji-modal-title").text()).toBe("Judul Modal");
    expect(wrapper.text()).toContain("Isi modal");
  });

  it("memindahkan fokus ke dialog dan mengunci scroll halaman", () => {
    const wrapper = mountModal();

    expect(document.activeElement).toBe(wrapper.get('[data-testid="uji-modal"]').element);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("memulihkan scroll halaman saat dilepas", () => {
    const wrapper = mountModal();

    wrapper.unmount();

    expect(document.body.style.overflow).toBe("");
  });

  it("memancarkan event close dari tombol tutup", async () => {
    const wrapper = mountModal();

    await wrapper.get('[data-testid="close-modal-btn"]').trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("memancarkan event close saat menekan Escape", async () => {
    const wrapper = mountModal();

    await wrapper.get('[data-testid="uji-modal"]').trigger("keydown.esc");

    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});
