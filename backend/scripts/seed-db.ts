import * as path from "path"
import * as dotenv from "dotenv"
import * as bcrypt from "bcrypt"
import db from "../config/database"

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") })

// Kenyan names for realistic data
const kenyanNames = [
  "Wanjiku Kamau",
  "Otieno Odhiambo",
  "Njeri Mwangi",
  "Kipchoge Keino",
  "Akinyi Onyango",
  "Muthoni Kariuki",
  "Omondi Ochieng",
  "Wangari Maathai",
  "Kimani Nganga",
  "Auma Obama",
  "Jomo Kenyatta",
  "Lupita Nyong'o",
  "Eliud Kipchoge",
  "Wangui Ngũgĩ",
  "Meja Mwangi",
]

// Transaction types
const transactionTypes = ["deposit", "withdrawal", "transfer", "payment", "mpesa_deposit", "mpesa_withdrawal"]

// Transaction descriptions
const transactionDescriptions = {
  deposit: ["Cash Deposit", "Salary Deposit", "Cheque Deposit", "Business Income"],
  withdrawal: ["ATM Withdrawal", "Over-the-counter Withdrawal", "Agent Withdrawal"],
  transfer: ["Account Transfer", "Family Support", "Business Payment", "Loan Repayment"],
  payment: ["Utility Payment", "School Fees", "Rent Payment", "Grocery Shopping", "Medical Bill"],
  mpesa_deposit: ["M-PESA Deposit", "M-PESA Transfer In", "Mobile Money Deposit"],
  mpesa_withdrawal: ["M-PESA Withdrawal", "M-PESA Transfer Out", "Mobile Money Withdrawal"],
}

// Kenyan locations
const locations = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Kitale",
  "Machakos",
  "Garissa",
]

// Generate a random account number
const generateAccountNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString()
}

// Generate a random Kenyan phone number
const generatePhoneNumber = () => {
  return `+254${Math.floor(700000000 + Math.random() * 99999999)}`
}

// Generate a random transaction reference
const generateReference = () => {
  return `VF${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`
}

// Generate a random IP address
const generateIpAddress = () => {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
}

// Generate a random device info
const generateDeviceInfo = () => {
  const devices = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
  ]
  return devices[Math.floor(Math.random() * devices.length)]
}

// Generate a random date within the last year
const generateDate = (daysAgo = 365) => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date
}

// Calculate risk score based on transaction details
const calculateRiskScore = (amount: number, type: string) => {
  let score = 0

  // Higher amounts have higher risk
  if (amount > 50000) score += 30
  else if (amount > 10000) score += 15
  else if (amount > 5000) score += 5

  // Certain transaction types are riskier
  if (type === "withdrawal" || type === "mpesa_withdrawal") score += 10
  if (type === "transfer") score += 5

  // Add some randomness
  score += Math.floor(Math.random() * 20)

  // Cap at 100
  return Math.min(score, 100)
}

// Seed the database with test data
async function seedDatabase() {
  try {
    console.log("🔄 Seeding database with test data...")

    // Create test users (excluding admin which should already exist)
    console.log("Creating test users...")
    const users = []

    for (let i = 0; i < kenyanNames.length; i++) {
      const name = kenyanNames[i]
      const firstName = name.split(" ")[0].toLowerCase()
      const email = `${firstName}@example.com`
      const password = await bcrypt.hash("Password123", 10)
      const role = i === 0 ? "admin" : i === 1 ? "agent" : "user"
      const balance = 5000 + Math.floor(Math.random() * 95000)
      const accountNumber = generateAccountNumber()
      const phoneNumber = generatePhoneNumber()

      const result = await db.query(
        `INSERT INTO users (name, email, password, role, balance, account_number, phone_number, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [name, email, password, role, balance, accountNumber, phoneNumber, generateDate()],
      )

      users.push({
        id: result.rows[0].id,
        name,
        email,
        role,
        balance,
        accountNumber,
      })

      console.log(`Created user: ${name} (${email})`)
    }

    // Create transactions
    console.log("Creating transactions...")
    const transactions = []
    const totalTransactions = 200

    for (let i = 0; i < totalTransactions; i++) {
      const userId = users[Math.floor(Math.random() * users.length)].id
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
      const amount = Math.floor(100 + Math.random() * 50000)
      const descriptions = transactionDescriptions[type as keyof typeof transactionDescriptions]
      const description = descriptions[Math.floor(Math.random() * descriptions.length)]
      const reference = generateReference()
      const location = locations[Math.floor(Math.random() * locations.length)]
      const ipAddress = generateIpAddress()
      const deviceInfo = generateDeviceInfo()
      const createdAt = generateDate(30) // Last 30 days

      // Determine recipient for transfers
      let recipientId = null
      if (type === "transfer") {
        // Pick a different user as recipient
        let potentialRecipient
        do {
          potentialRecipient = users[Math.floor(Math.random() * users.length)].id
        } while (potentialRecipient === userId)
        recipientId = potentialRecipient
      }

      // Calculate risk score
      const riskScore = calculateRiskScore(amount, type)

      // Determine status based on risk score
      let status = "completed"
      if (riskScore > 75) {
        status = "flagged"
      } else if (Math.random() < 0.05) {
        status = "failed"
      }

      // Determine if reported
      const reported = riskScore > 85 || Math.random() < 0.03

      const result = await db.query(
        `INSERT INTO transactions 
         (user_id, recipient_id, type, amount, description, reference, status, reported, risk_score, location, ip_address, device_info  amount, description, reference, status, reported, risk_score, location, ip_address, device_info, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          userId,
          recipientId,
          type,
          amount,
          description,
          reference,
          status,
          reported,
          riskScore,
          location,
          ipAddress,
          deviceInfo,
          createdAt,
        ],
      )

      transactions.push({
        id: result.rows[0].id,
        userId,
        recipientId,
        type,
        amount,
        status,
        riskScore,
      })
    }

    console.log(`Created ${totalTransactions} transactions`)

    // Create fraud alerts for high-risk transactions
    console.log("Creating fraud alerts...")
    const fraudAlerts = []

    for (const transaction of transactions) {
      if (transaction.riskScore > 75 || Math.random() < 0.05) {
        const status = Math.random() < 0.7 ? "new" : Math.random() < 0.5 ? "reviewing" : "resolved"
        const description = `Suspicious ${transaction.type} of KSH ${transaction.amount.toFixed(2)}`

        // For resolved alerts, add resolution details
        let resolution = null
        let resolvedBy = null
        let resolvedAt = null

        if (status === "resolved") {
          resolution =
            Math.random() < 0.7
              ? "Legitimate transaction confirmed with customer"
              : "Fraudulent transaction, account credited"
          // Assign to an admin or agent
          const adminUsers = users.filter((u) => u.role === "admin" || u.role === "agent")
          resolvedBy = adminUsers[Math.floor(Math.random() * adminUsers.length)].id
          resolvedAt = new Date()
        }

        const result = await db.query(
          `INSERT INTO fraud_alerts 
           (user_id, transaction_id, description, status, risk_score, resolution, resolved_by, resolved_at, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [
            transaction.userId,
            transaction.id,
            description,
            status,
            transaction.riskScore,
            resolution,
            resolvedBy,
            resolvedAt,
            generateDate(15),
          ],
        )

        fraudAlerts.push({
          id: result.rows[0].id,
          transactionId: transaction.id,
          status,
        })
      }
    }

    console.log(`Created ${fraudAlerts.length} fraud alerts`)

    // Create fraud rules
    console.log("Creating fraud rules...")
    const fraudRules = [
      {
        name: "Large Transaction Amount",
        description: "Flag transactions above a certain amount",
        ruleType: "amount",
        threshold: 50000,
      },
      {
        name: "Multiple Transactions",
        description: "Flag if user makes more than 5 transactions in an hour",
        ruleType: "frequency",
        threshold: 5,
      },
      {
        name: "International Transactions",
        description: "Flag transactions from outside Kenya",
        ruleType: "location",
        threshold: null,
      },
      {
        name: "New Account Large Withdrawal",
        description: "Flag large withdrawals from new accounts",
        ruleType: "new_account",
        threshold: 10000,
      },
      {
        name: "Unusual Location",
        description: "Flag transactions from locations user has not used before",
        ruleType: "unusual_location",
        threshold: null,
      },
    ]

    const adminUser = users.find((u) => u.role === "admin")

    for (const rule of fraudRules) {
      await db.query(
        `INSERT INTO fraud_rules 
         (name, description, rule_type, threshold, is_active, created_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [rule.name, rule.description, rule.ruleType, rule.threshold, true, adminUser?.id, generateDate(60)],
      )
    }

    console.log(`Created ${fraudRules.length} fraud rules`)

    // Create customer support tickets
    console.log("Creating customer support tickets...")
    const supportSubjects = [
      "Unable to complete transaction",
      "Suspicious activity on my account",
      "Need to update personal information",
      "Question about transaction fees",
      "Problem with mobile app",
      "Disputed transaction",
      "Account access issues",
    ]

    const supportMessages = [
      "I tried to make a payment but it failed multiple times. Can you help?",
      "I noticed a transaction I did not authorize. Please help me secure my account.",
      "I need to update my phone number and email address. What is the process?",
      "Could you explain the fee structure for international transfers?",
      "The mobile app keeps crashing when I try to view my transaction history.",
      "I want to dispute a transaction made on [date]. I did not authorize it.",
      "I cannot log into my account. It says my password is incorrect but I am sure it is right.",
    ]

    for (let i = 0; i < 15; i++) {
      const randomUser = users.filter((u) => u.role === "user")[Math.floor(Math.random() * (users.length - 2))]
      const subjectIndex = Math.floor(Math.random() * supportSubjects.length)
      const status = Math.random() < 0.6 ? "open" : Math.random() < 0.5 ? "in_progress" : "resolved"

      let assignedTo = null
      let resolvedAt = null

      if (status !== "open") {
        const supportStaff = users.filter((u) => u.role === "admin" || u.role === "agent")
        assignedTo = supportStaff[Math.floor(Math.random() * supportStaff.length)].id

        if (status === "resolved") {
          resolvedAt = new Date()
        }
      }

      await db.query(
        `INSERT INTO customer_support 
         (user_id, subject, message, status, assigned_to, created_at, resolved_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          randomUser.id,
          supportSubjects[subjectIndex],
          supportMessages[subjectIndex],
          status,
          assignedTo,
          generateDate(20),
          resolvedAt,
        ],
      )
    }

    console.log("Created 15 customer support tickets")

    // Create notifications
    console.log("Creating notifications...")
    const notificationTypes = ["transaction", "security", "account", "support"]
    const notificationTitles = {
      transaction: ["Transaction Completed", "Large Transaction Alert", "Transaction Failed"],
      security: ["Security Alert", "New Device Login", "Password Changed"],
      account: ["Account Update", "Balance Low", "Statement Available"],
      support: ["Ticket Updated", "Support Response", "Issue Resolved"],
    }

    const notificationMessages = {
      transaction: [
        "Your transaction of KSH [amount] has been completed successfully.",
        "A large transaction of KSH [amount] was processed on your account.",
        "Your transaction of KSH [amount] failed. Please try again.",
      ],
      security: [
        "Unusual login activity detected on your account. Please verify.",
        "New device login detected. If this was not you, please contact support.",
        "Your password was changed successfully.",
      ],
      account: [
        "Your account details have been updated successfully.",
        "Your account balance is below KSH 1,000. Consider making a deposit.",
        "Your monthly statement is now available for download.",
      ],
      support: [
        "Your support ticket has been updated. Check for details.",
        "Support team has responded to your inquiry.",
        "Your support issue has been resolved. Please let us know if you need further assistance.",
      ],
    }

    for (const user of users) {
      // Create 3-7 notifications per user
      const notificationCount = 3 + Math.floor(Math.random() * 5)

      for (let i = 0; i < notificationCount; i++) {
        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
        const titles = notificationTitles[type as keyof typeof notificationTitles]
        const messages = notificationMessages[type as keyof typeof notificationMessages]

        const titleIndex = Math.floor(Math.random() * titles.length)
        let message = messages[titleIndex]

        // Replace [amount] placeholder with random amount
        if (message.includes("[amount]")) {
          const amount = (1000 + Math.floor(Math.random() * 50000)).toFixed(2)
          message = message.replace("[amount]", amount)
        }

        const isRead = Math.random() < 0.7

        await db.query(
          `INSERT INTO notifications 
           (user_id, title, message, type, is_read, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user.id, titles[titleIndex], message, type, isRead, generateDate(10)],
        )
      }
    }

    console.log("Created notifications for all users")

    // Create audit logs
    console.log("Creating audit logs...")
    const auditActions = [
      "user.login",
      "user.logout",
      "user.password_change",
      "user.profile_update",
      "transaction.create",
      "transaction.approve",
      "transaction.reject",
      "fraud.alert.create",
      "fraud.alert.resolve",
      "fraud.rule.create",
      "fraud.rule.update",
      "admin.login",
      "admin.user_update",
      "admin.system_setting_change",
    ]

    for (let i = 0; i < 100; i++) {
      const user = users[Math.floor(Math.random() * users.length)]
      const action = auditActions[Math.floor(Math.random() * auditActions.length)]

      let entityType = null
      let entityId = null
      let details = null

      if (action.startsWith("user.")) {
        entityType = "user"
        entityId = user.id

        if (action === "user.login") {
          details = `User logged in from ${locations[Math.floor(Math.random() * locations.length)]}`
        } else if (action === "user.logout") {
          details = "User logged out"
        } else if (action === "user.password_change") {
          details = "User changed password"
        } else if (action === "user.profile_update") {
          details = "User updated profile information"
        }
      } else if (action.startsWith("transaction.")) {
        entityType = "transaction"
        entityId = transactions[Math.floor(Math.random() * transactions.length)].id

        if (action === "transaction.create") {
          details = "Transaction created"
        } else if (action === "transaction.approve") {
          details = "Transaction approved after review"
        } else if (action === "transaction.reject") {
          details = "Transaction rejected due to suspicious activity"
        }
      } else if (action.startsWith("fraud.")) {
        if (action.includes("alert")) {
          entityType = "fraud_alert"
          entityId = fraudAlerts.length > 0 ? fraudAlerts[Math.floor(Math.random() * fraudAlerts.length)].id : null

          if (action === "fraud.alert.create") {
            details = "Fraud alert created"
          } else if (action === "fraud.alert.resolve") {
            details = "Fraud alert resolved"
          }
        } else if (action.includes("rule")) {
          entityType = "fraud_rule"
          entityId = Math.floor(Math.random() * 5) + 1

          if (action === "fraud.rule.create") {
            details = "Fraud detection rule created"
          } else if (action === "fraud.rule.update") {
            details = "Fraud detection rule updated"
          }
        }
      } else if (action.startsWith("admin.")) {
        entityType = "admin"
        entityId = user.id

        if (action === "admin.login") {
          details = `Admin logged in from ${locations[Math.floor(Math.random() * locations.length)]}`
        } else if (action === "admin.user_update") {
          details = `Admin updated user ${users[Math.floor(Math.random() * users.length)].name}`
        } else if (action === "admin.system_setting_change") {
          details = "Admin changed system settings"
        }
      }

      await db.query(
        `INSERT INTO audit_logs 
         (user_id, action, entity_type, entity_id, details, ip_address, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user.id, action, entityType, entityId, details, generateIpAddress(), generateDate(30)],
      )
    }

    console.log("Created 100 audit logs")

    console.log("✅ Database seeding completed successfully")

    // Print test credentials
    console.log("\n🔑 Test Credentials:")
    console.log("Admin User:")
    console.log("  Email: admin@vibeflow.com")
    console.log("  Password: Admin123!")

    console.log("\nRegular Users:")
    for (let i = 2; i < 5; i++) {
      console.log(`  Email: ${users[i].email}`)
      console.log("  Password: Password123")
    }
  } catch (error) {
    console.error("❌ Database seeding error:", error)
  } finally {
    // Close the pool
    db.pool.end()
  }
}

// Run the seed function
seedDatabase()

