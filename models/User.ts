import { Schema, model, models, type InferSchemaType } from "mongoose"

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ""
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

export type UserDocument = InferSchemaType<typeof userSchema>

export const User = models.User || model("User", userSchema)
