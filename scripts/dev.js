const { spawn } = require("child_process")
const path = require("path")

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

// Function to run a command with colored output
function runCommand(command, args, options = {}) {
  const label = options.label || command
  const color = options.color || colors.reset

  console.log(`${color}${colors.bright}Starting ${label}...${colors.reset}`)

  const proc = spawn(command, args, {
    stdio: ["inherit", "pipe", "pipe"],
    shell: true,
    ...options,
  })

  // Add prefix to each line of output
  const prefixOutput = (data, isError = false) => {
    const lines = data.toString().split("\n")
    lines.forEach((line) => {
      if (line.trim()) {
        const outputColor = isError ? colors.red : color
        console.log(`${outputColor}[${label}]${colors.reset} ${line}`)
      }
    })
  }

  proc.stdout.on("data", (data) => prefixOutput(data))
  proc.stderr.on("data", (data) => prefixOutput(data, true))

  proc.on("error", (error) => {
    console.error(`${colors.red}Error running ${label}: ${error.message}${colors.reset}`)
  })

  return proc
}

// Start the backend server
const backendProc = runCommand("npx", ["ts-node", "--project", "tsconfig.server.json", "backend/server.ts"], {
  label: "Backend",
  color: colors.cyan,
})

// Start the frontend development server
const frontendProc = runCommand("npx", ["next", "dev"], {
  label: "Frontend",
  color: colors.magenta,
})

// Handle process termination
process.on("SIGINT", () => {
  console.log(`\n${colors.yellow}Shutting down servers...${colors.reset}`)
  backendProc.kill()
  frontendProc.kill()
  process.exit(0)
})

console.log(`\n${colors.green}${colors.bright}Development servers started!${colors.reset}`)
console.log(`${colors.green}› Frontend: http://localhost:3000${colors.reset}`)
console.log(`${colors.green}› Backend API: http://localhost:5000/api${colors.reset}`)
console.log(`${colors.green}› Health check: http://localhost:5000/api/health${colors.reset}`)
console.log(`\n${colors.dim}Press Ctrl+C to stop all servers${colors.reset}\n`)

