import { PoolClient } from "pg";
import pool from "~/config/database";

export class UserRepository {
  async findUserById(
    id: string | number,
    poolClient?: PoolClient,
  ): Promise<any> {
    const db = poolClient ?? pool;

    const {
      rows: [user],
    } = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);

    return user;
  }
}
