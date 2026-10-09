import { describe, it, expect } from "vitest";
import routerOptions from "./router.options";
import router, { createAppRouter, routes } from "./router";
import { createMemoryHistory } from "vue-router";

describe("router", () => {
  it("router.options menyuplai rute dari routes.ts", () => {
    expect(routerOptions.routes()).toBe(routes);
  });

  it("mendefinisikan seluruh rute aplikasi", () => {
    const paths = createAppRouter(createMemoryHistory())
      .getRoutes()
      .map((route) => route.path);

    expect(paths).toEqual(
      expect.arrayContaining([
        "/auth/login",
        "/auth/register",
        "/",
        "/cash-flows/:cashFlowId",
        "/users",
        "/profile",
        "/:pathMatch(.*)*",
      ])
    );
  });

  it("menyediakan instance router bawaan", () => {
    expect(router.hasRoute("home")).toBe(true);
  });
});
