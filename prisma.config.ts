// prisma.config.ts

import 'dotenv/config'
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // This uses your primary connection URL for Migrate/CLI operations
    url: env("DATABASE_URL"), 
  },
});