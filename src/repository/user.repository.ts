import { PoolClient } from "pg";
import pool from "~/config/database";
import { User } from "~/modules/auth/auth.types";

export class UserRepository {
  async findUserById(
    id: string | number,
    poolClient?: PoolClient,
  ): Promise<any> {
    const db = poolClient ?? pool;

    return await db.query(`SELECT * users as u WHERE id = $1`, [id]);
  }
}
