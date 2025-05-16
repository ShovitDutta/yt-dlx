import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
const compiledTestsBaseDir = process.cwd();
function findCompiledTestFiles(dir: string): string[] {
    let testFiles: string[] = [];
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) testFiles = testFiles.concat(findCompiledTestFiles(fullPath));
        else if (stat.isFile() && entry.endsWith(".test.js")) testFiles.push(fullPath);
    }
    return testFiles;
}
async function runTests() {
    console.log("Starting test runner...");
    console.log("Searching for compiled test files in:", compiledTestsBaseDir);
    const testFiles = findCompiledTestFiles(compiledTestsBaseDir);
    if (testFiles.length === 0) {
        console.warn("No test files found matching *.test.js or *.spec.js in the compiled spec directory.");
        return;
    }
    console.log(`Found ${testFiles.length} test file(s):`);
    testFiles.forEach(file => console.log(` - ${path.relative(compiledTestsBaseDir, file)}`));
    console.log("\n--- Running tests sequentially ---");
    for (const testFile of testFiles) {
        const relativePath = path.relative(compiledTestsBaseDir, testFile);
        console.log(`\n--- Running test: ${relativePath} ---`);
        try {
            execSync(`node "${testFile}"`, { stdio: "inherit" });
            console.log(`--- Test passed: ${relativePath} ---`);
        } catch (error: any) {
            console.error(`--- Test failed: ${relativePath} ---`);
            if (error.stdout) console.error("Stdout:", error.stdout.toString());
            if (error.stderr) console.error("Stderr:", error.stderr.toString());
            console.error(`Exiting with status ${error.status || 1}`);
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
