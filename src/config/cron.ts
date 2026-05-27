import cron, { ScheduledTask, TaskContext } from "node-cron";

class CronJob {
  private static instance: CronJob;
  private initialized = false;

  private constructor() {
    this.initCron();
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
    return cron.schedule("0 2 * * *", () => {
      
    });
  }
}

export default CronJob.getInstance();
