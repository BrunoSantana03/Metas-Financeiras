import { useMemo } from "react";
import { useSQLiteContext } from "expo-sqlite";

export function useTransactionsDatabase() {
  const db = useSQLiteContext();

  return useMemo(
    () => ({
      async create({ target_id, amount, observation }) {
        const result = await db.runAsync(
          "INSERT INTO transactions (target_id, amount, observation) VALUES ($target_id, $amount, $observation)",
          { $target_id: target_id, $amount: amount, $observation: observation || null }
        );

        return result.lastInsertRowId;
      },

      async listByTargetId(targetId) {
        return db.getAllAsync(
          `
            SELECT id, target_id, amount, observation, created_at
            FROM transactions
            WHERE target_id = $target_id
            ORDER BY created_at DESC, id DESC
          `,
          { $target_id: targetId }
        );
      },

      async remove(id) {
        await db.runAsync("DELETE FROM transactions WHERE id=$id", { $id: id });
      }
    }),
    [db]
  );
}
