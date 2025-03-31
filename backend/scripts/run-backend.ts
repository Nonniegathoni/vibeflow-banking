import { execSync } from "child_process"

// Simple script to run the backend server
try {
  console.log("Starting backend server...")
  // Use execSync to run the command in the current process
  execSync("node backend/server.js", { stdio: "inherit" })
} catch (error) {
  console.error("Failed to start backend server:", error)
  process.exit(1)
}

