// scripts/installK6.js
import { execSync } from "child_process";
import os from "os";

console.log("🔍 Checking for k6 installation...");

try {
  execSync("k6 version", { stdio: "ignore" });
  console.log("✅ k6 is already installed!");
} catch {
  console.log("⚙️  k6 not found, installing...");

  const platform = os.platform();
  try {
    if (platform === "win32") {
      console.log("🪟 Installing k6 on Windows using Chocolatey...");
      execSync("choco install k6 -y", { stdio: "inherit" });
    } else if (platform === "darwin") {
      console.log("🍎 Installing k6 on macOS using Homebrew...");
      execSync("brew install k6", { stdio: "inherit" });
    } else {
      console.log("🐧 Installing k6 on Linux (Debian/Ubuntu)...");
      execSync(
        `sudo apt update && sudo apt install gnupg2 ca-certificates -y &&
         curl -fsSL https://dl.k6.io/key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/k6-archive-keyring.gpg &&
         echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list &&
         sudo apt update && sudo apt install k6 -y`,
        { stdio: "inherit" }
      );
    }
    console.log("✅ k6 installed successfully!");
  } catch (err) {
    console.error("❌ Failed to install k6 automatically. Please install manually from https://grafana.com/k6");
  }
}
