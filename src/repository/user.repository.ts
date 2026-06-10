import { PoolClient } from "pg";
import pool from "~/config/database";
import { User } from "~/modules/auth/dto/auth.dto";

export class UserRepository {
  async findUserById(
    id: string | number,
    poolClient?: PoolClient,
  ): Promise<User> {
    const db = poolClient ?? pool;

    const {
      rows: [user],
    } = await db.query<User>(`SELECT * FROM users WHERE id = $1`, [id]);

    return user;
  }
}
