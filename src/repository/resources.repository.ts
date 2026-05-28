import { PoolClient } from "pg";
import pool from "~/config/database";
import { Resource } from "~/modules/posts/posts.types";

export class ResourcesRepository {
  async deleteResource(id: string | number, poolClient?: PoolClient) {
    const db = poolClient ?? pool;
    return await db.query(`DELETE FROM resources WHERE id = $1`, [id]);
  }

  async deleteResources(ids: string[] | number[], poolClient?: PoolClient) {
    const db = poolClient ?? pool;
    return await db.query(`DELETE FROM resources WHERE id = ANY($1)`, [ids]);
  }

  async deleteResourceByPost(
    resourceId: number,
    postId: number,
    poolClient?: PoolClient,
  ) {
    const db = poolClient ?? pool;
    return await db.query(
      `DELETE FROM resources WHERE id = $1 AND post_id = $2`,
      [resourceId, postId],
    );
  }

  async findResourceByPost(
    postId: number,
    poolClient?: PoolClient,
  ): Promise<Resource> {
    const db = poolClient ?? pool;
    const {
      rows: [resource],
    } = await db.query<Resource>(
      `SELECT * FROM resources WHERE  post_id = $1`,
      [postId],
    );

    return resource;
  }
}
