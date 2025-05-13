import { type, arch, totalmem, homedir, hostname, release } from "os";
import { createInterface } from "readline";
import { spawn } from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

console.clear();
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[1;31m",
  green: "\x1b[1;32m",
};

function formatBytes(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

function runScript() {
  console.log(colors.red + "=================================" + colors.reset);
  console.log(
    colors.green +
      "@system:" +
      colors.reset +
      " welcome to the " +
      colors.red +
      "yt-dlp" +
      colors.reset +
      " dev-test-kit"
  );
  console.log(
    colors.green +
      "@system:" +
      colors.reset +
      " os type: " +
      colors.red +
      type() +
      colors.reset
  );
  console.log(
    colors.green +
      "@system:" +
      colors.reset +
      " cpu architecture: " +
      colors.red +
      arch() +
      colors.reset
  );
  console.log(
    colors.green +
      "@system:" +
      colors.reset +
      " total memory: " +
      colors.red +
      formatBytes(totalmem()) +
      colors.reset
  );
  console.log(
    colors.green +
      "@system:" +
      colors.reset +
      " home directory: " +
      colors.red +
      homedir() +
      colors.reset
  );
  console.log(
    colors.green +
      "@system:" +
      colors.reset +
      " hostname: " +
      colors.red +
      hostname() +
      colors.reset
  );
  console.log(
    colors.green +
      "@system:" +
      colors.reset +
      " release: " +
      colors.red +
      release() +
      colors.reset
  );
  console.log(colors.red + "=================================" + colors.reset);
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  let packageJson;
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const packageJsonPath = path.resolve(__dirname, "..", "package.json");
    packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  } catch (error) {
    console.error(
      colors.red + "@error:" + colors.reset,
      "Error reading package.json:",
      error
    );
    rl.close();
    return;
  }
  const { scripts } = packageJson;
  if (!scripts || Object.keys(scripts).length === 0) {
    console.error(
      colors.red + "@error:" + colors.reset,
      "No scripts found in package.json"
    );
    rl.close();
    return;
  }
  console.log(colors.red + "=================================" + colors.reset);
  const scriptKeys = Object.keys(scripts).filter((key) => key !== "start");
  scriptKeys.forEach((script, index) => {
    const displayIndex = index + 1;
    console.log(
      colors.green +
        "@script:" +
        colors.reset +
        " " +
        colors.red +
        displayIndex +
        colors.reset +
        ": " +
        script
    );
  });
  console.log(colors.red + "=================================" + colors.reset);
  rl.question(
    colors.green +
      "@info:" +
      colors.reset +
      " enter the " +
      colors.red +
      "number" +
      colors.reset +
      " of the " +
      colors.green +
      "script" +
      colors.reset +
      " you want to run: " +
      colors.red,
    (answer) => {
      console.log(colors.reset);
      const scriptIndex = parseInt(answer) - 1;
      if (scriptIndex >= 0 && scriptIndex < scriptKeys.length) {
        const scriptName = scriptKeys[scriptIndex];
        const command = scripts[scriptName];
        console.log(colors.green + "@choice:" + colors.reset, scriptName);
        const childProcess = spawn(command, {
          shell: true,
          stdio: "inherit",
        });
        childProcess.on("error", (error) => {
          console.error(colors.red + "@error:" + colors.reset, error);
        });
        childProcess.on("exit", (code) => {
          if (code !== 0) {
            console.error(
              colors.red + "@error:" + colors.reset,
              "Exited with code " + code
            );
          }
          runScript();
        });
      } else {
        console.log(colors.red + "@error:" + colors.reset, "invalid choice.");
        runScript();
      }
      rl.close();
    }
  );
}

runScript();
