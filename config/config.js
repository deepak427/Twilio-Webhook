import dotenv from "dotenv";

dotenv.config();

export const config = {
    host: "gateway01.eu-central-1.prod.aws.tidbcloud.com",
    port: 4000,
    user: process.env.USER,
    password: process.env.PASSWORD_TiDB,
    database: "spam_jam",
    ssl: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
  };