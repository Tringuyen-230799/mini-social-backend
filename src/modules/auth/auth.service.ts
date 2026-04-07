import bcrypt from "bcrypt";
import pool from "~/config/database";
import { SignupDto, LoginDto, AuthResponse, User } from "./auth.types";
import { SALT_ROUNDS } from "~/shared/constraint";
import { generateToken } from "~/shared/utils/jwt";
import { hashedPassword, isPasswordValid } from "~/shared/utils/bcrypt";

export class AuthService {
  async signup(data: SignupDto): Promise<AuthResponse> {
    const { username, email, password } = data;

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email, username],
    );

    if (existingUser.rows.length > 0) {
      throw new Error("User with this email or username already exists");
    }

    const hash = await hashedPassword(password);

    // Create user
    const result = await pool.query<User>(
      `INSERT INTO users (username, email, password) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, email, avatar_url`,
      [username, email, hash],
    );

    const user = result.rows[0];

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
      },
      token,
    };
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const { email, password } = data;

    const result = await pool.query<User>(
      "SELECT id, username, email, password, avatar_url FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = result.rows[0];

    const isValid = await isPasswordValid(password, user.password);

    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
      },
      token,
    };
  }

  async getUserById(userId: number): Promise<User | null> {
    const result = await pool.query<User>(
      "SELECT id, username, email, avatar_url, created_at, updated_at FROM users WHERE id = $1",
      [userId],
    );

    return result.rows[0] || null;
  }
}
