# Everyday PDF tools

Available in English and Nepali at `/en/tools/pdf-tools/` and `/ne/tools/pdf-tools/`. The sixth homepage tool belongs to Photos & files and supports search and favourites.

- **Extract:** comma-separated page numbers and ascending ranges, including Nepali digits. Requested order is preserved; duplicate page numbers are used once. Output is one PDF.
- **Merge:** all pages from two to ten PDFs in the displayed order. Arrow buttons reorder files. Selecting real files replaces the example; additional selections append in merge mode.
- **Compress:** image-based JPEG pages at 90, 120 or 150 DPI, or an object-stream rewrite that preserves text and links. Raster modes explicitly explain loss of searchable text, links and controls. Size reduction is not guaranteed; if output would be larger, the original is offered with an explanation.
- **Page to image:** one selected page as JPG or PNG at 72, 150 or 200 DPI, subject to pixel limits.

Examples are generated locally with PDF-Lib; the initial two-page extraction is ready without selecting a personal file. Preview shows only the first result page. Download remains an explicit action.

Files and output live in memory and object URLs, with no upload endpoint, analytics, external CDN or document persistence. Clearing releases references and revokes output URLs. No original file is overwritten. The renderer worker, fonts, CMaps (including Korean/CJK) and image decoders use local, version-pinned assets. Dependencies load only on the PDF tool page.

Limits: 20 MiB per input, 50 MiB total, ten files, 500 pages per input/output. Image-based compression is limited to 50 pages and renders sequentially. Each canvas is capped at 12 MP and 4,096 px per side, so effective DPI may be lower than requested. Cancelling invalidates the operation; work already parsing/rendering can finish before its memory is released, but cannot publish a stale result.

Password-protected and digital-signature-field PDFs are rejected. Extract/merge and text-preserving compression reject interactive form fields rather than produce detached form widgets. Image modes intentionally flatten visual page content. Document-level bookmarks, attachments and form logic are outside the page-copy workflow. This is not an editor, redaction tool or signature service.

`predev` and `prebuild` run `scripts/prepare-pdf-assets.mjs` to copy renderer resources from the pinned npm installation into ignored `public/vendor/pdfjs/`. The generated assets include upstream licences. `public/_headers` permits same-origin workers, blob fonts and WebAssembly compilation, without permitting arbitrary JavaScript eval.

Validation: `npm run verify` includes real PDF page-copy/range/boundary tests. `npm run test:pdf` uses a local Wrangler preview for actual downloads, rendering, file order, quality modes, errors, cancellation, privacy requests, favourites and bilingual responsive layouts. Do not run synthetic uploads against production (the tool has no upload API).

References: [PDF-Lib API](https://pdf-lib.js.org/docs/api/classes/pdfdocument), [PDF.js API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html). Reviewed 7 November 2026.
