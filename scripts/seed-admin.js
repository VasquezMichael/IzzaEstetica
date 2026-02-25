/* eslint-disable no-console */
require("dotenv").config({ path: ".env.local" })
require("dotenv").config()

const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.MONGODB_DB_NAME || "izza_estetica"
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin Izza"

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI.")
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD.")
}

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME })

  const userSchema = new mongoose.Schema(
    {
      name: String,
      email: { type: String, unique: true, required: true, lowercase: true },
      passwordHash: { type: String, required: true },
      role: { type: String, enum: ["user", "admin"], default: "user" },
      active: { type: Boolean, default: true }
    },
    { timestamps: true }
  )

  const User = mongoose.models.User || mongoose.model("User", userSchema)

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)
  const email = ADMIN_EMAIL.toLowerCase().trim()

  const existing = await User.findOne({ email })
  if (existing) {
    existing.passwordHash = passwordHash
    existing.role = "admin"
    existing.active = true
    if (!existing.name) existing.name = ADMIN_NAME
    await existing.save()
    console.log(`Admin actualizado: ${email}`)
  } else {
    await User.create({
      name: ADMIN_NAME,
      email,
      passwordHash,
      role: "admin",
      active: true
    })
    console.log(`Admin creado: ${email}`)
  }

  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error(error)
  await mongoose.disconnect()
  process.exit(1)
})
