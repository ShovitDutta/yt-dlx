import web from "../web";
import colors from "colors";
import Engine from "./Engine";
import retry from "async-retry";
import { execSync } from "child_process";
import YouTubeID from "../web/YouTubeId";
import type EngineOutput from "../interfaces/EngineOutput";

var reOpts = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 5000,
  factor: 2,
};

async function sip(): Promise<string> {
  return await retry(async () => {
    var op = execSync("curl https://checkip.amazonaws.com --insecure", {
      stdio: "pipe",
    });
    return op.toString().trim();
  }, reOpts);
}

async function tip(): Promise<string> {
  return await retry(async () => {
    var op = execSync("curl --socks5-hostname 127.0.0.1:9050 https://checkip.amazonaws.com --insecure", {
      stdio: "pipe",
    });
    return op.toString().trim();
  }, reOpts);
}

async function service(): Promise<boolean> {
  return await retry(async () => {
    try {
      execSync("service --version", { stdio: "ignore" });
      execSync("service tor stop", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }, reOpts);
}

async function systemctl(): Promise<boolean> {
  return await retry(async () => {
    try {
      execSync("systemctl --version", { stdio: "ignore" });
      execSync("systemctl tor stop", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }, reOpts);
}

async function sudo(): Promise<boolean> {
  return await retry(async () => {
    try {
      execSync("sudo --version", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }, reOpts);
}

export default async function Agent({ query, useTor, verbose }: { query: string; useTor?: boolean; verbose?: boolean }): Promise<any> {
  console.clear();
  var iptor: string = "";
  var ipsys: string = "";
  var isservice: boolean = false;
  var issystemctl: boolean = false;
  if (useTor) {
    if (process.platform === "win32") ipsys = await sip();
    switch (true) {
      case await systemctl():
        execSync("systemctl restart tor", {
          stdio: "inherit",
        });
        issystemctl = true;
        ipsys = await sip();
        iptor = await tip();
        break;
      case await service():
        execSync("service tor restart", {
          stdio: "inherit",
        });
        isservice = true;
        ipsys = await sip();
        iptor = await tip();
        break;
      default:
        ipsys = await sip();
        break;
    }
  } else ipsys = await sip();

  if (verbose) {
    switch (useTor) {
      case true:
        console.log(colors.green("@info:"), "system ipAddress", ipsys);
        if (process.platform === "win32") {
          console.log(colors.red("@error:"), "TOR can't be used on your system!");
        } else console.log(colors.green("@info:"), "socks5 ipAddress", iptor);
        break;
      default:
        console.log(colors.green("@info:"), "system ipAddress", ipsys);
        break;
    }
    console.log(colors.green("@info:"), "is sudo available", await sudo());
    console.log(colors.green("@info:"), "is service available", isservice);
    console.log(colors.green("@info:"), "is systemctl available", issystemctl);
  }
  var TubeBody: any;
  var respEngine: EngineOutput | undefined = undefined;
  var videoId: string | undefined = await YouTubeID(query);
  if (!videoId) {
    TubeBody = await web.searchVideos({ query });
    if (!TubeBody[0]) throw new Error("Unable to get response!");
    console.log(colors.green("@info:"), "preparing payload for", TubeBody[0].title);
    respEngine = await Engine({
      sudo: await sudo(),
      ipAddress: iptor || ipsys,
      query: "https://www.youtube.com/watch?v=" + TubeBody[0].id,
    });
    return respEngine;
  } else {
    TubeBody = await web.singleVideo({ videoId });
    if (!TubeBody) throw new Error("Unable to get response!");
    console.log(colors.green("@info:"), "preparing payload for", TubeBody.title);
    respEngine = await Engine({
      sudo: await sudo(),
      ipAddress: iptor || ipsys,
      query: "https://www.youtube.com/watch?v=" + TubeBody.id,
    });
    return respEngine;
  }
}
