console.clear();
const os = require("os");
const fs = require("fs");
const { execSync } = require("child_process");

const port = 3000;
const cpus = os.cpus().length;
const generateNginxConf = instances => {
  const upstreamServers = Array.from({ length: instances }, (_, i) => `server 127.0.0.1:${port + i};`).join("\n");
  fs.writeFileSync(
    "nginx.conf",
    `# The script below is dynamically generated to adapt to varying server configurations.
worker_processes 1;
events {
worker_connections 1024;
}
http {
upstream backend {
${upstreamServers}
}
server {
listen 8000;
location / {
proxy_pass http://backend;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_cache_bypass $http_upgrade;
}
}
}
`,
  );
};
const nports = process.env.koyeb || cpus;
generateNginxConf(nports);
execSync("nginx -c $(pwd)/nginx.conf", {
  stdio: "inherit",
});
for (let i = 0; i < nports; i++) {
  execSync(`pm2 start yarn --name="next-${port + i}" -- start -p ${port + i}`, {
    stdio: "inherit",
  });
}
execSync("pm2 monit", { stdio: "inherit" });
process.on("exit", () => {
  console.clear();
  console.log("Stopping PM2 + NGINX...");
  execSync("yarn run quit", { stdio: "inherit" });
  console.log("PM2 + NGINX stopped successfully...");
});
process.on("SIGINT", () => {
  console.clear();
  console.log("Stopping PM2 + NGINX...");
  execSync("yarn run quit", { stdio: "inherit" });
  console.log("PM2 + NGINX stopped successfully...");
  process.exit();
});
