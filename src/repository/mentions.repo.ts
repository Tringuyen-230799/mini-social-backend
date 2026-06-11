import { PoolClient } from "pg";
import pool from "~/config/database";
import { MentionEntity } from "~/shared/entity/mentions.entity";

export class MentionsRepository {
  async createMentions(
    commentId: number,
    mentionedUserIds: number[],
    client?: PoolClient,
  ): Promise<MentionEntity[]> {
    const db = client ?? pool;
    const values = mentionedUserIds
      .map((userId) => `(${commentId}, ${userId})`)
      .join(", ");

    const insertMentionsQuery = `INSERT INTO mentions (comment_id, mentioned_user_id) VALUES ${values} RETURNING *`;
    const { rows: result } = await db
      .query(insertMentionsQuery)
      .catch((err) => {
        console.error("Error inserting mentions:", err);
        throw new Error("Failed to create mentions");
      });
    return result;
  }
}
