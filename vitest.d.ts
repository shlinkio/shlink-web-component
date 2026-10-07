import { Download } from "playwright";

declare module "vitest/browser" {
  interface BrowserCommands {
    listenForFileDownload: () => Promise<Download>;
  }
}
