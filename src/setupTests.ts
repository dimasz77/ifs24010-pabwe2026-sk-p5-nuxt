import "@testing-library/jest-dom";
import { enableAutoUnmount } from "@vue/test-utils";
import { afterEach } from "vitest";

(globalThis as { DELCOM_BASEURL?: string }).DELCOM_BASEURL ??= "https://open-api.delcom.org/api/v1";

enableAutoUnmount(afterEach);

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(): void {
    this.open = true;
  };
}

if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function close(): void {
    this.open = false;
  };
}
