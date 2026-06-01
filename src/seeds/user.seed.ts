import { faker } from "@faker-js/faker";
import { hashedPassword } from "~/shared/utils/bcrypt";
import { PoolClient } from "pg";

async function seedUsers(
  numOfRecord: number = 100,
  client: PoolClient,
): Promise<void | Error> {
  try {
    const hashed = await hashedPassword("Password@123");

    for (let i = 1; i <= numOfRecord; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email();
      const avatarUrl = faker.image.avatar();

      await client.query(
        `INSERT INTO users (first_name, last_name, email, password, avatar_url) 
         VALUES ($1, $2, $3, $4, $5)`,
        [firstName, lastName, email, hashed, avatarUrl],
      );

      console.log(`User ${i} has been created`);
    }

    console.log(`✅ Successfully seeded ${numOfRecord} users`);
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    return error as Error;
  }
}

export default seedUsers;
