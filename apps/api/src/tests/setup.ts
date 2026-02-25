process.env.NODE_ENV = "test";
process.env.MONGO_URI =
  process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/my-platform-test";
