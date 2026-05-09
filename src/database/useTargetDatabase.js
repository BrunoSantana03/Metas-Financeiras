import { useMemo } from "react";
import { useSQLiteContext } from "expo-sqlite";

export function useTargetDatabase() {
  const db = useSQLiteContext();

  return useMemo(
    () => ({
      async create({ name, amount }) {
        const result = await db.runAsync(
          "INSERT INTO targets (name, amount) VALUES ($name, $amount)",
          { $name: name, $amount: amount }
        );

        return result.lastInsertRowId;
      },

      async update({ id, name, amount }) {
        await db.runAsync(
          "UPDATE targets SET name=$name, amount=$amount, updated_at=CURRENT_TIMESTAMP WHERE id=$id",
          { $id: id, $name: name, $amount: amount }
        );
      },

      async remove(id) {
        await db.runAsync("DELETE FROM targets WHERE id=$id", { $id: id });
      },

      async show(id) {
        return db.getFirstAsync(
          `
            SELECT
              t.id,
              t.name,
              t.amount AS target,
              COALESCE(SUM(tr.amount), 0) AS accumulated
            FROM targets t
            LEFT JOIN transactions tr ON tr.target_id = t.id
            WHERE t.id = $id
            GROUP BY t.id
          `,
          { $id: id }
        );
      },

      async index() {
        return db.getAllAsync(`
          SELECT
            t.id,
            t.name,
            t.amount AS target,
            COALESCE(SUM(tr.amount), 0) AS accumulated
          FROM targets t
          LEFT JOIN transactions tr ON tr.target_id = t.id
          GROUP BY t.id
          ORDER BY
            CASE
              WHEN t.amount > 0 THEN COALESCE(SUM(tr.amount), 0) / t.amount
              ELSE 0
            END DESC,
            t.updated_at DESC
        `);
      }
    }),
    [db]
  );
}
