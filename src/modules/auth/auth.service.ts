import pool from "~/config/database";
import { AuthResponse, User } from "./dto/auth.dto";
import { generateToken } from "~/shared/utils/jwt";
import { hashedPassword, isPasswordValid } from "~/shared/utils/bcrypt";
import { BadRequestException } from "~/shared/utils/error-exception";
import { LoginInput, SignupInput } from "./schemas/auth.validator";

export class AuthService {
  async signup(data: SignupInput): Promise<AuthResponse> {
    const { firstName, lastName, email, password } = data;

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      throw new BadRequestException("User is already exists");
    }

    const hash = await hashedPassword(password);

    const result = await pool.query<User>(
      `INSERT INTO users (first_name, last_name, email, password) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, first_name, last_name, email, avatar_url`,
      [firstName, lastName, email, hash],
    );

    const user = result.rows[0];

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        username: user.first_name + " " + user.last_name,
        email: user.email,
        avatar_url: user.avatar_url,
      },
      token,
    };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    const { email, password } = data;

    const {
      rows: [user],
    } = await pool.query<User>("SELECT * FROM users WHERE email = $1", [email]);

    if (!user) {
      throw new BadRequestException("Invalid email or password");
    }

    const isValid = await isPasswordValid(password, user.password);

    if (!isValid) {
      throw new BadRequestException("Invalid email or password");
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        username: user.first_name + " " + user.last_name,
        email: user.email,
        avatar_url: user.avatar_url,
      },
      token,
    };
  }

  async getUserById(userId: number): Promise<User | null> {
    const {
      rows: [user],
    } = await pool.query<User>("SELECT * FROM users WHERE id = $1", [userId]);

    return user || null;
  }
}
