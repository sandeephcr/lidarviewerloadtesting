// createPackage.js
import { execSync } from "child_process";
import fs from "fs";

const outputFile = "lidarviewer-loadtesting-ready.zip";

console.log("\n📦 Building ready-to-run ZIP package...");

try {
  // remove old zip if exists
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
    console.log("🧹 Old package removed.");
  }

  // build the zip (excluding node_modules and .git)
  execSync(
    `zip -r ${outputFile} . -x "*.git*" "node_modules/*" "*.DS_Store"`,
    { stdio: "inherit" }
  );

  console.log(`\n✅ Package created successfully: ${outputFile}`);
  console.log(`📁 Location: ${process.cwd()}/${outputFile}`);
  console.log("\nYou can now share this file — it’s fully self-contained.");
} catch (error) {
  console.error("❌ Error while creating the ZIP package:", error.message);
  process.exit(1);
}
