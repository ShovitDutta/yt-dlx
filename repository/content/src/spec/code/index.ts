import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";
const compiledTestsBaseDir = process.cwd();
function findCompiledTestFiles(dir: string): string[] {
    let testFiles: string[] = [];
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            testFiles = testFiles.concat(findCompiledTestFiles(fullPath));
        } else if (stat.isFile() && entry.endsWith(".test.js")) {
            testFiles.push(fullPath);
        }
    }
    return testFiles;
}
async function runTestFile(testFile: string): Promise<void> {
    const relativePath = path.relative(compiledTestsBaseDir, testFile);
    console.log(`\n--- Running test: ${relativePath} ---`);
    return new Promise((resolve, reject) => {
        const testProcess = spawn("node", [testFile], { stdio: "inherit" });
        testProcess.on("error", error => {
            console.error(`Failed to start test process for ${relativePath}:`, error);
            reject(error);
        });
        testProcess.on("exit", code => {
            if (code === 0) {
                console.log(`--- Test passed: ${relativePath} ---`);
                resolve();
            } else {
                console.error(`--- Test failed: ${relativePath} with exit code ${code} ---`);
                reject(new Error(`Test failed with exit code ${code}`));
            }
        });
    });
}
async function runTests() {
    console.log("Starting test runner...");
    console.log("Searching for compiled test files in:", compiledTestsBaseDir);
    const testFiles = findCompiledTestFiles(compiledTestsBaseDir);
    if (testFiles.length === 0) {
        console.warn("No test files found matching *.test.js in the compiled spec directory.");
        return;
    }
    console.log(`Found ${testFiles.length} test file(s):`);
    testFiles.forEach(file => console.log(` - ${path.relative(compiledTestsBaseDir, file)}`));
    console.log("\n--- Running tests sequentially ---");
    for (const testFile of testFiles) {
        try {
            await runTestFile(testFile);
        } catch (error: any) {
            console.error("\nAn error occurred during test execution:", error.message);
            process.exit(error.status || 1);
        }
    }
    console.log("\nAll tests finished successfully.");
    process.exit(0);
}
runTests().catch(err => {
    console.error("\nAn unhandled error occurred during test execution:", err);
    process.exit(1);
});
