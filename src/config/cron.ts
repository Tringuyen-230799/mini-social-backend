import cron, { ScheduledTask } from "node-cron";
import { PostsService } from "~/modules/posts/posts.service";
import { DELETE_POST_SCHEDULE } from "~/shared/constraint/cron";

class CronJob {
  private static instance: CronJob;
  private initialized = false;
  private postService: PostsService;

  private constructor() {
    this.initCron();
    this.postService = new PostsService();
  }

  private initCron() {
    if (this.initialized) return;
    this.initialized = true;
  }

  static getInstance() {
    if (!CronJob.instance) {
      CronJob.instance = new CronJob();
    }
    return CronJob.instance;
  }

  scheduleDeletePostTask(): ScheduledTask {
    const task = cron.schedule(DELETE_POST_SCHEDULE, async () => {
      const startTime = Date.now();
      try {
        console.log(`[CRON] Starting cleanup job`);

        const numOfPostDelete = await this.postService.cleanupDeletedPosts();

        const duration = Date.now() - startTime;

        console.log(
          `[CRON] Success: ${numOfPostDelete} posts deleted in ${duration}ms`,
        );
      } catch (error) {
        const duration = Date.now() - startTime;

        console.error(`[CRON] Failed after ${duration}ms:`, error);
      }
    });

    task.start();
    return task;
  }
}

export default CronJob.getInstance();
