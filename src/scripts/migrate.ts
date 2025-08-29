import "dotenv/config";
import AppDataSource from "../data-source";

(async () => {
  try {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    console.log("[migrate] running pending migrations…");
    await AppDataSource.runMigrations();
    console.log("[migrate] done");
  } catch (err) {
    console.error("[migrate] failed:", err);  // this will appear in Render logs
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  }
})();
