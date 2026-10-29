export function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'number') return val;
  if (Array.isArray(val)) {
    if (val.length === 0) return "'{}'::text[]";
    const arrStr = val.map((name) => '"' + String(name).replace(/"/g, '\\"') + '"').join(',');
    return `'{${arrStr.replace(/'/g, "''")}}'::text[]`;
  }
  if (typeof val === 'object') {
    return "'" + JSON.stringify(val).replace(/'/g, "''") + "'::jsonb";
  }
  return "'" + String(val).replace(/'/g, "''") + "'";
}

const BACKUP_TABLES = ['event_config', 'gifts', 'gift_pledges', 'rsvps', 'messages'];

export function buildSqlBackup(dump) {
  let sql = `-- ====================================================================\n`;
  sql += `-- BACKUP DO BANCO DE DADOS - CHÁ DA MAITÊ\n`;
  sql += `-- Data: ${dump.exported_at}\n`;
  sql += `-- ====================================================================\n\n`;

  for (const tbl of BACKUP_TABLES) {
    const rows = dump.tables[tbl] || [];
    sql += `-- Tabela: ${tbl} (${rows.length} registros)\n`;
    for (const row of rows) {
      const cols = Object.keys(row);
      const vals = cols.map((c) => escapeSql(row[c]));
      const updateClause = cols.filter((c) => c !== 'id').map((c) => `${c} = EXCLUDED.${c}`).join(', ');
      sql += `INSERT INTO public.${tbl} (${cols.join(', ')})\nVALUES (${vals.join(', ')})\nON CONFLICT (id) DO UPDATE SET ${updateClause};\n`;
    }
    sql += `\n`;
  }

  return sql;
}
