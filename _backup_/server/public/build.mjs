import { platform } from "os";
import { exec } from "child_process";

const commands = {
  darwin: `tsc -p tsconfig.json && caxa --input . --output "out/server.app" -- "{{caxa}}/node_modules/.bin/node" "{{caxa}}/build/index.js"`,
  win32: `tsc -p tsconfig.json && caxa --input . --output "out/server.exe" -- "{{caxa}}/node_modules/.bin/node" "{{caxa}}/build/index.js"`,
  linux: `tsc -p tsconfig.json && caxa --input . --output "out/server.sh" -- "{{caxa}}/node_modules/.bin/node" "{{caxa}}/build/index.js"`,
};
const command = commands[platform()];
if (command) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
      return;
    }
    console.log(`Command stdout: ${stdout}`);
  });
} else console.error(`Unsupported platform: ${platform()}`);
