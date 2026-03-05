import * as XLSX from 'xlsx';

/**
 * Parse Excel buffer (xlsx/xls) into array of objects using first row as headers.
 * @param {Buffer} buffer
 * @returns {{ headers: string[], rows: Record<string, string>[] }}
 */
export function parseExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) {
    return { headers: [], rows: [] };
  }
  const data = XLSX.utils.sheet_to_json(firstSheet, {
    header: 1,
    defval: '',
    raw: false,
  });
  if (!Array.isArray(data) || data.length === 0) {
    return { headers: [], rows: [] };
  }
  const headers = (data[0] || []).map((h) => String(h || '').trim());
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i] || [];
    const obj = {};
    headers.forEach((h, idx) => {
      const val = row[idx];
      obj[h] = val != null ? String(val).trim() : '';
    });
    rows.push(obj);
  }
  return { headers, rows };
}
