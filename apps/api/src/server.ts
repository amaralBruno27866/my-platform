import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`[api] running on http://localhost:${env.port}`);
  console.log(`[api] docs on http://localhost:${env.port}/api-docs`);
});
