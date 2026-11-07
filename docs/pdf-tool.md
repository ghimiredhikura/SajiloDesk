# Everyday PDF tools

English: `/en/tools/pdf-tools/`. Nepali: `/ne/tools/pdf-tools/`. The PDF card is first among the six homepage tools, with dedicated PDF and Photos & files filters, search and favourites. Files stay in the browser; there is no document-upload endpoint.

## Preview before and after processing

Selecting a PDF immediately opens its original pages in the right panel. All pages have scrollable placeholders; nearby pages render as sharp canvases at screen pixel density, capped at 3 MP per canvas. Only five nearby canvases stay allocated. A 30-page fixture verifies that the last page renders and earlier canvases are released. Each new PDF replaces the viewer worker; stale loads/renders cannot replace the latest selection.

After extraction, merging or compression, **Result** shows every output page. **Original** remains available for comparison. For merging, a compact file chooser previews each selected original. Page count, a fit-width/zoom control and a bounded scrolling area keep the panel compact; zoom preserves the current page. Converted images use the same scroll area at their actual generated resolution.

Examples are generated locally with PDF-Lib. The initial two-page extraction is ready without selecting a personal file. Download is always an explicit action and is labelled as the result, even while comparing the original.

## Supported tasks and quality

- **Extract:** comma-separated page numbers and ascending ranges, including Nepali digits. Requested order is preserved; duplicate page numbers are used once. Output is one PDF with unchanged page content.
- **Merge:** all pages from two to ten PDFs in displayed order. Arrow buttons reorder files. Real files replace the example; additional selections append in merge mode.
- **Compress, high quality (default):** load a separate copy and recompress eligible JPEG XObjects at 92% quality at their original pixel dimensions. Page text, vector drawing operators and page geometry are not rasterised. Smaller-file mode uses 85% JPEG quality with the same resolution. Only images at least 3% smaller replace an original stream.
- **Compress, lossless:** rewrite object streams without changing image bytes. Image quality and text remain unchanged. This may provide little or no size reduction.
- **Compress, scanned pages:** explicit alternative that rebuilds visual pages at 250 DPI and 90% JPEG quality. This removes selectable text, links and form controls. It stops early and retains the original if the accumulated image data already exceeds the input size.
- **Page to image:** one page as lossless PNG (default) or 95% JPEG, at 300 DPI by default; 200, 150 and 72 DPI remain available. Output shows actual pixels and effective DPI. PNG pHYs and JPEG JFIF density metadata match that resolution, without re-encoding the image samples. Resolution is independent of preview size. Higher DPI cannot recover detail absent from an original scan.

Compression uses actual final byte counts. If output is not smaller, offer the original with an explicit message. There is no guaranteed percentage or target size.

### Conservative image optimisation

The custom optimisation keeps all page content operators intact and replaces only ordinary 8-bit DeviceRGB/DeviceGray JPEG streams. It preserves original dimensions and does not resample. It skips masks, explicit Decode/DecodeParms, CMYK/ICCBased and other unusual colour spaces, EXIF-oriented streams, unknown/non-sRGB ICC profiles, images above 12 MP and tiny streams. Standard single-segment sRGB profiles, including browser/Skia JPEGs, are supported. Browser decode/encode failures retain the original image.

PNG/Flate, JPX, CCITT, JBIG2 and unsupported images are retained. This is deliberately a selective optimiser, not a claim to implement qpdf/Ghostscript or optimise every PDF encoding. Lossless mode is available when any image recompression is unacceptable. The explicit scanned-page mode covers visual rebuilding when appropriate.

## Limits, privacy and implementation

20 MiB per input, 50 MiB total, ten files, 500 pages per input/output. Scanned rebuilding supports up to 50 pages. Export/rebuild canvases are capped at 12 MP and 4,096 px per side; effective DPI can therefore be lower for very large pages.

Files, output and object URLs remain in memory. No analytics, external CDN or document persistence is used. Clear/page exit releases document references, canvases, workers and output URLs. Original files are never overwritten. The renderer worker, fonts, CMaps (including Korean/CJK) and image decoders are local, version-pinned assets. Dependencies load only on the PDF tool page.

Password-protected and digital-signature-field PDFs are rejected. Extract/merge and text-preserving compression reject interactive forms rather than produce detached widgets. Image modes intentionally flatten visual content. Page-copy extraction/merging does not rebuild document-level bookmarks, attachments or form logic. This is not an editor, redaction tool or signature service.

`predev`/`prebuild` run `scripts/prepare-pdf-assets.mjs`, copying renderer resources and upstream licences into ignored `public/vendor/pdfjs/`. The existing CSP permits same-origin workers, blob fonts and WebAssembly without permitting arbitrary JavaScript eval.

## Validation

`npm run verify` includes page-copy/range/boundary tests and conservative JPEG eligibility tests. For browser QA install Playwright WebKit once (`npx playwright install webkit`) and run `TEST_BASE_URL=http://127.0.0.1:8791 npm run test:pdf` against local Wrangler (use PowerShell environment syntax on Windows).

The browser suite checks every original/result page, merged-input previews, scroll-to-last-page and zoom, a five-canvas bound, 300 DPI PNG dimensions, byte-for-byte retention of text/vector content streams, unchanged JPEG bytes in lossless mode, real downloads, file order/rotation, errors/cancellation, eight bilingual responsive layouts, iPhone 14 settings with WebKit touch and HiDPI canvases, and no uploads/external requests. Physical-device testing remains separate.

References: [PDF-Lib API](https://pdf-lib.js.org/docs/api/classes/pdfdocument), [PDFRawStream](https://github.com/Hopding/pdf-lib/blob/master/src/core/objects/PDFRawStream.ts), [PDF.js HiDPI rendering](https://mozilla.github.io/pdf.js/examples/index.html), [PDF.js JPEG handling](https://github.com/mozilla/pdf.js/blob/master/src/core/jpeg_stream.js). Reviewed 7 November 2026.
