export const SALT_ROUNDS = 10;
export const JWT_SECRET: string =
  process.env.JWT_SECRET || "default-secret-key";
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";
export const FOLDER_UPLOAD = {
  POSTS: 'posts',
  VIDEOS: 'videos'
}
export const TIME_DELETE_PERMANENT = 30;
export const MAX_COMMENT_DEPTH = 3;