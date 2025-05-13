const color = require("colors");
const { https } = require("follow-redirects");
const { spawnSync } = require("child_process");
const { createWriteStream, existsSync } = require("fs");

console.log(color.cyan("Checking if Python is already installed"));
const pyCheck = spawnSync("python", ["--version"]);

const tarballFile = "Python-3.12.1.tgz";
if (pyCheck.error || pyCheck.status !== 0) {
  if (!existsSync(tarballFile)) {
    const pythonTarballURL = `https://www.python.org/ftp/python/3.12.1/${tarballFile}`;
    console.log(color.green("Python not found. Downloading..."));
    const file = createWriteStream(tarballFile);
    https
      .get(pythonTarballURL, response => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(color.green("Extracting..."));
          const extractResult = spawnSync("tar", ["-xzf", tarballFile], {
            stdio: "inherit",
          });
          if (extractResult.error || extractResult.status !== 0) {
            console.error(color.red("Error extracting Python tarball."));
            process.exit(1);
          }
          const pythonSourceDir = "Python-3.12.1";
          console.log(color.green(`Changing directory to ${pythonSourceDir}`));
          process.chdir(pythonSourceDir);
          console.log(color.green("Configuring Python"));
          spawnSync("./configure", [], {
            stdio: "inherit",
          });
          console.log(color.green("Building Python"));
          spawnSync("make", [], { stdio: "inherit" });
          console.log(color.green("Running Python --version"));
          spawnSync("./python", ["--version"], {
            stdio: "inherit",
          });
          console.log(color.green("Cleaning up"));
          process.chdir("..");
          spawnSync("rm", ["-rf", pythonSourceDir, tarballFile], {
            stdio: "inherit",
          });
          console.log(color.green("Done"));
          spawnSync("rm", ["-rf", tarballFile], {
            stdio: "inherit",
          });
        });
      })
      .on("error", err => {
        console.error(color.red(`Error downloading Python source tarball: ${err.message}`));
      });
  } else {
    console.log(color.cyan("Python tarball already present. Skipping download."));
  }
} else console.log(color.cyan("Python is already installed. Exiting."));
