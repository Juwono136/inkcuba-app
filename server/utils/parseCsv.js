/**
 * Parse CSV buffer (UTF-8) into array of objects using first row as headers.
 * Handles quoted fields and comma-separated values.
 * @param {Buffer} buffer
 * @returns {{ headers: string[], rows: Record<string, string>[] }}
 */
export function parseCsv(buffer) {
  const text = buffer.toString('utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split('\n').filter((line) => line.trim() !== '');

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const parseRow = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if ((c === ',' && !inQuotes) || (c === '\n' && !inQuotes)) {
        result.push(current.trim());
        current = '';
      } else {
        current += c;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]).map((h) => h.replace(/^"|"$/g, '').trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (values[idx] || '').replace(/^"|"$/g, '').trim();
    });
    rows.push(obj);
  }

  return { headers, rows };
}
