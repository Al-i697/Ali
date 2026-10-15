import { sql, type SQL } from 'drizzle-orm';
import type { SQLiteColumn } from 'drizzle-orm/sqlite-core';

/** LIKE %term% مع تهريب % و _ حتى لا يفسّرها كرموز بحث */
export function likeContains(column: SQLiteColumn, term: string): SQL {
  const escaped = term.replace(/[\\%_]/g, (m) => `\\${m}`);
  return sql`${column} like ${`%${escaped}%`} escape '\\'`;
}
