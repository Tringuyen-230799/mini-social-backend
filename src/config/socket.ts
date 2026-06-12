import { Server, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyToken } from "../shared/utils/jwt";
import {
  NOTIFICATION_EVENT,
  NOTIFICATION_TYPE,
} from "~/shared/constraint/notification";
import { SendCommentNotiPayload } from "~/shared/types/socket";

export class SocketService {
  private static instance: SocketService | null = null;
  private io: Server;
  private userSockets: Map<number, string> = new Map();

  private constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.ORIGIN || "http://localhost:3000",
        credentials: true,
      },
    });

    this.authenticate();
    this.initializeHandlers();
  }

  private authenticate() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = verifyToken(token);

      if (!decoded || !decoded.userId) {
        return next(new Error("Authentication error: Invalid token"));
      }

      socket.data.userId = decoded.userId;
      next();
    });
  }

  public static getInstance(httpServer?: HTTPServer): SocketService {
    if (!SocketService.instance) {
      if (!httpServer) {
        throw new Error("httpServer is required to initialize SocketService");
      }
      SocketService.instance = new SocketService(httpServer);
    }
    return SocketService.instance;
  }

  private initializeHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      const userId = socket.data.userId;

      if (userId) {
        this.userSockets.set(userId, socket.id);
        console.log(`User ${userId} authenticated and connected`);
      }

      socket.on("disconnect", () => {
        if (userId) {
          this.userSockets.delete(userId);
          console.log(`User ${userId} disconnected`);
        }
      });
    });
  }

  public getSocketId(userId: number) {
    return this.userSockets.get(userId);
  }

  public getIO(): Server {
    return this.io;
  }

  async sendCommentNotification(
    userId: number,
    payload: SendCommentNotiPayload,
  ) {
    const socketId = this.getSocketId(userId);
    try {
      if (!socketId) {
        console.log(
          `User ${userId} is offline. Skipping real-time notification.`,
        );
        return;
      }

      this.io.to(socketId).emit(NOTIFICATION_EVENT.COMMENT, {
        type: NOTIFICATION_TYPE.COMMENT,
        ...payload,
      });
      console.log(`Real-time notification sent to user ${userId}`);
    } catch (error) {
      console.error(error)
    }
  }
}
