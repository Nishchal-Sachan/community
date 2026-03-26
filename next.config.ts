// Same as: require("dotenv").config(); — load .env before the rest of the config runs.
import { config as loadEnv } from "dotenv";
import type { NextConfig } from "next";

loadEnv();
console.log("EMAIL_USER:", process.env.EMAIL_USER);

const nextConfig: NextConfig = {};

export default nextConfig;
