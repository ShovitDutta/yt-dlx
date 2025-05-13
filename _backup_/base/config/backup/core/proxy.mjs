import fs from "fs";
import Koa from "koa";
import chalk from "chalk";
import dotenv from "dotenv";
import cors from "@koa/cors";
import logger from "koa-logger";
import helmet from "koa-helmet";
import * as ngrok from "@ngrok/ngrok";
import bodyParser from "koa-bodyparser";
if (fs.existsSync(".env.local")) dotenv.config({ path: ".env.local" });
else dotenv.config();

async function httpProxy() {
  const app = new Koa();
  app.use(async (ctx, next) => {
    console.log(chalk.magentaBright.bold(new Date().toLocaleString() + " Request on port 8080:"), chalk.italic(`${ctx.method} ${ctx.url}`));
    await next();
    console.log(chalk.cyanBright.bold(new Date().toLocaleString() + " Request on port 8000:"), chalk.italic(`${ctx.method} ${ctx.url}`));
  });
  app.use(cors());
  app.use(logger());
  app.use(helmet());
  app.use(bodyParser());
  await ngrok.authtoken(process.env.NGROK);
  const listener = await ngrok.forward({
    addr: 8000,
    circuit_breaker: 0.8,
    oauth_provider: "google",
    domain: process.env.NGROK_URI,
  });
  const proxyServer = app.listen(8080, () => console.log(listener.url()));
  process.on("SIGINT", async () => {
    console.log("Shutting down proxyServer...");
    await ngrok.disconnect();
    proxyServer.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  });
}

httpProxy();
