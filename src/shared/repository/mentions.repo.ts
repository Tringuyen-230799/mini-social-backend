import { PoolClient } from "pg";
import pool from "~/config/database";

export class MentionsRepository {
  async createMentions(commentId: number, mentionedUserIds: number[]) {
    const client: PoolClient = await pool.connect();
    try {
      await client.query("BEGIN");
    }
    catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

}
