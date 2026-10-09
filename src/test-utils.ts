import { mount, type VueWrapper } from "@vue/test-utils";
import { createPinia, setActivePinia, type Pinia } from "pinia";
import { createMemoryHistory, type Router } from "vue-router";
import type { Component } from "vue";
import { createAppRouter } from "./router";
import { useAuthStore } from "./features/auth/states/authStore";
import { useUsersStore } from "./features/users/states/usersStore";
import { useCashFlowsStore } from "./features/cashflows/states/cashFlowsStore";

export type PreloadedState = Record<string, unknown>;

export function createMockPinia(initialState: PreloadedState = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);

  const authStore = useAuthStore(pinia);
  const usersStore = useUsersStore(pinia);
  const cashFlowsStore = useCashFlowsStore(pinia);

  [authStore, usersStore, cashFlowsStore].forEach((store) => {
    const matching = Object.entries(initialState).filter(([key]) => key in store.$state);
    Object.assign(store.$state, Object.fromEntries(matching));
  });

  return { pinia, authStore, usersStore, cashFlowsStore };
}

export interface RenderWithProvidersOptions {
  preloadedState?: PreloadedState;
  pinia?: Pinia;
  router?: Router;
  props?: Record<string, unknown>;
  slots?: Record<string, string>;
  stubs?: Record<string, boolean | Component>;
}

export function renderWithProviders(
  component: Component,
  {
    preloadedState = {},
    pinia,
    router = createAppRouter(createMemoryHistory()),
    props = {},
    slots = {},
    stubs = {},
  }: RenderWithProvidersOptions = {}
) {
  const mock = pinia
    ? {
        pinia,
        authStore: useAuthStore(pinia),
        usersStore: useUsersStore(pinia),
        cashFlowsStore: useCashFlowsStore(pinia),
      }
    : createMockPinia(preloadedState);

  const wrapper: VueWrapper = mount(component, {
    props,
    slots,
    attachTo: document.body,
    global: {
      plugins: [mock.pinia, router],
      stubs,
    },
  });

  return { wrapper, router, ...mock };
}

export const mockUser = {
  id: "user-1",
  name: "Budi Santoso",
  email: "budi@del.ac.id",
  photo: null,
  created_at: "2026-01-15T10:30:00.000Z",
  updated_at: "2026-01-16T10:30:00.000Z",
};

export const mockCashFlow = {
  id: "cf-1",
  type: "inflow" as const,
  source: "cash" as const,
  label: "Gaji",
  nominal: 1500000,
  description: "Gaji bulanan",
  created_at: "2026-02-01T08:00:00.000Z",
  updated_at: "2026-02-02T08:00:00.000Z",
};

export const mockStats = {
  total_inflow: 2000000,
  total_outflow: 500000,
  cash: 800000,
  savings: 600000,
  loans: 100000,
};

export function mockJsonResponse(body: unknown): Response {
  return { json: async () => body } as unknown as Response;
}
