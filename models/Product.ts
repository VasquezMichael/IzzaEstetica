import { Schema, model, models, type InferSchemaType } from "mongoose"

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    originalPrice: {
      type: Number,
      default: null,
      min: 0
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    badge: {
      type: String,
      trim: true,
      default: null
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    sizes: {
      type: [String],
      default: []
    },
    details: {
      type: String,
      default: ""
    },
    howToUse: {
      type: String,
      default: ""
    },
    ingredients: {
      type: String,
      default: ""
    },
    delivery: {
      type: String,
      default: ""
    },
    active: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: String,
      default: null
    },
    updatedBy: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
)

productSchema.index({ category: 1 })
productSchema.index({ active: 1 })

export type ProductDocument = InferSchemaType<typeof productSchema>

export const Product = models.Product || model("Product", productSchema)
