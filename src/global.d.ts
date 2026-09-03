/** @file Ambient declarations for the vendored browser libraries.
 *
 * `declare global` matters here: `app.js` and `export.js` access these through
 * `globalThis` (e.g. `globalThis.JSZip`), so they must be properties of the
 * global object rather than module-scope consts.
 */
export {};

declare global {
  /** JSZip UMD global provided by vendor/jszip.min.js. */
  var JSZip: { new (): any };

  /** FileSaver.js global provided by vendor/FileSaver.min.js. */
  var saveAs: (blob: Blob, filename: string, opts?: any) => void;

  /** Read-only observation hook used by the screenshot/CI smoke tests. */
  interface SpaDiagnostics {
    readonly ready: boolean;
    readonly fileCount: number;
    readonly analyzing: boolean;
    fileNames(): string[];
  }

  interface Window {
    __SPA__?: SpaDiagnostics;
  }
}
