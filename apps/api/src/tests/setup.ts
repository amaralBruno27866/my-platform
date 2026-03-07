process.env.NODE_ENV = "test";
process.env.MONGO_URI =
  process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/my-platform-test";
process.env.AUTH_JWT_SECRET =
  process.env.AUTH_JWT_SECRET ??
  "test-only-secret-with-32-chars-minimum-for-jwt-signing";
