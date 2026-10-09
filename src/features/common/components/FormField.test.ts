import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FormField from "./FormField.vue";

describe("FormField", () => {
  it("menghubungkan label dengan input lewat atribut for", () => {
    const wrapper = mount(FormField, {
      props: { inputId: "nama", label: "Nama" },
      slots: { default: '<input id="nama" />' },
    });

    const label = wrapper.get("label");
    expect(label.attributes("for")).toBe("nama");
    expect(label.text()).toBe("Nama");
    expect(wrapper.find("input#nama").exists()).toBe(true);
  });

  it("tidak menampilkan tanda wajib secara bawaan", () => {
    const wrapper = mount(FormField, { props: { inputId: "a", label: "A" } });

    expect(wrapper.find("span").exists()).toBe(false);
  });

  it("menampilkan tanda wajib yang disembunyikan dari pembaca layar", () => {
    const wrapper = mount(FormField, { props: { inputId: "a", label: "A", required: true } });

    const star = wrapper.get("span");
    expect(star.text()).toBe("*");
    expect(star.attributes("aria-hidden")).toBe("true");
  });
});
