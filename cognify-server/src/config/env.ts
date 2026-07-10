export const env = {
  PORT: process.env.PORT || 3000,

  DATABASE_URL:
    process.env.DATABASE_URL || "",

  JWT_SECRET:
    process.env.JWT_SECRET || "supersecret",

  GROQ_API_KEY:
    process.env.GROQ_API_KEY || "",

  OPENAI_API_KEY:
    process.env.OPENAI_API_KEY || "",

  MESH_API_KEY:
    process.env.MESH_API_KEY || "",

  REDIS_URL: process.env.REDIS_URL,
  REDIS_HOST:
    process.env.REDIS_HOST || "127.0.0.1",

  NODE_ENV:
    process.env.NODE_ENV || "development",

  // AWS S3
  AWS_ACCESS_KEY_ID:
    process.env.AWS_ACCESS_KEY_ID || "",

  AWS_SECRET_ACCESS_KEY:
    process.env.AWS_SECRET_ACCESS_KEY || "",

  AWS_REGION:
    process.env.AWS_REGION || "us-east-1",

  AWS_S3_BUCKET:
    process.env.AWS_S3_BUCKET || "",

  // Stripe
  STRIPE_SECRET_KEY:
    process.env.STRIPE_SECRET_KEY || "",

  STRIPE_WEBHOOK_SECRET:
    process.env.STRIPE_WEBHOOK_SECRET || "",

  STRIPE_PRICE_PRO:
    process.env.STRIPE_PRICE_PRO || "",

  STRIPE_PRICE_ENTERPRISE:
    process.env.STRIPE_PRICE_ENTERPRISE || "",

  // Integrations
  SLACK_BOT_TOKEN:
    process.env.SLACK_BOT_TOKEN || "",

  GOOGLE_SERVICE_ACCOUNT_EMAIL:
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",

  GOOGLE_PRIVATE_KEY:
    process.env.GOOGLE_PRIVATE_KEY || "",

  NOTION_API_KEY:
    process.env.NOTION_API_KEY || "",

  CLIENT_URL:
    process.env.CLIENT_URL || "http://localhost:5173",

  SENTRY_DSN:
    process.env.SENTRY_DSN || "",

  RAZORPAY_KEY_ID:
    process.env.RAZORPAY_KEY_ID || "",

  RAZORPAY_KEY_SECRET:
    process.env.RAZORPAY_KEY_SECRET || "",
};
