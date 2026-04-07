import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../constraint";

export const hashedPassword = async (password: string) => await bcrypt.hash(password, SALT_ROUNDS);

export const isPasswordValid = async (hash: string, password: string) => await bcrypt.compare(hash, password);