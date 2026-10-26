/* Purpose: file export helpers: CSV, Excel (SheetJS), PDF (jsPDF + autotable), print. Heavy libraries load only on demand. */
import { loadLib } from '../loader.js';

/** Trigger a browser download for a Blob. */
export function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

const cell = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

/** Build CSV text from rows and column definitions [{key,label,value?}]. */
export function toCSV(rows, cols) {
  const val = (r, c) => (c.value ? c.value(r) : r[c.key]);
  return [cols.map((c) => cell(c.label)).join(','), ...rows.map((r) => cols.map((c) => cell(val(r, c))).join(','))].join('\r\n');
}

/** Download rows as CSV (UTF-8 with BOM so Excel shows Indian scripts correctly). */
export function downloadCSV(rows, cols, name = 'export') {
  downloadBlob(new Blob(['\ufeff', toCSV(rows, cols)], { type: 'text/csv;charset=utf-8' }), `${name}.csv`);
}

/** Download rows as an .xlsx file using SheetJS. */
export async function downloadXLSX(rows, cols, name = 'export') {
  await loadLib('xlsx');
  const val = (r, c) => (c.value ? c.value(r) : r[c.key]);
  const data = rows.map((r) => Object.fromEntries(cols.map((c) => [c.label, val(r, c)])));
  const ws = window.XLSX.utils.json_to_sheet(data); const wb = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  window.XLSX.writeFile(wb, `${name}.xlsx`);
}

/** Download rows as a PDF table using jsPDF + autotable. */
export async function downloadPDF(rows, cols, name = 'export', title = '') {
  await loadLib('jspdf'); await loadLib('autotable');
  const { jsPDF } = window.jspdf; const doc = new jsPDF({ orientation: cols.length > 6 ? 'landscape' : 'portrait' });
  if (title) { doc.setFontSize(14); doc.text(title, 14, 16); }
  const val = (r, c) => { const v = c.value ? c.value(r) : r[c.key]; return v == null ? '' : String(v); };
  doc.autoTable({ startY: title ? 22 : 12, head: [cols.map((c) => c.label)], body: rows.map((r) => cols.map((c) => val(r, c))), styles: { fontSize: 8 }, headStyles: { fillColor: [79, 70, 229] } });
  doc.save(`${name}.pdf`);
}

/** Print the page (or a given element) using the print stylesheet. */
export function printElement(el) {
  if (!el) return window.print();
  el.classList.add('print-target');
  document.documentElement.setAttribute('data-printing', '');
  window.print();
  document.documentElement.removeAttribute('data-printing'); el.classList.remove('print-target');
}
