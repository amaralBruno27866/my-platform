import { app } from "./app";
import { env } from "./config/env";
import { connectMongo, disconnectMongo } from "./config/mongo";

async function bootstrap(): Promise<void> {
  await connectMongo();

  const server = app.listen(env.port, () => {
    console.log(`[api] running on http://localhost:${env.port}`);
    console.log(`[api] docs on http://localhost:${env.port}/api-docs`);
  });

  const shutdown = async (): Promise<void> => {
    server.close(async () => {
      await disconnectMongo();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error) => {
  console.error("[api] bootstrap failed", error);
  process.exit(1);
});
