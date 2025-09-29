// vitest.setup.ts
import "@testing-library/jest-dom/vitest";

// Polyfill ResizeObserver cho jsdom (Radix UI cần)
import { ResizeObserver as PolyfillResizeObserver } from "@juggle/resize-observer";
if (!globalThis.ResizeObserver) {
  // ts-expect-error: inject vào môi trường test
  globalThis.ResizeObserver = PolyfillResizeObserver;
}

// (tuỳ chọn) Nếu về sau có lib cần matchMedia, bật luôn mock gọn:
// if (!window.matchMedia) {
//   // @ts-expect-error: jsdom mock
//   window.matchMedia = () => ({
//     matches: false,
//     media: "",
//     onchange: null,
//     addListener() {},
//     removeListener() {},
//     addEventListener() {},
//     removeEventListener() {},
//     dispatchEvent() { return false; },
//   });
// }
