const mongoose = require("mongoose");

const BundleSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["pick", "static"], default: "pick" },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    quantity: { type: Number, required: true },
    discountPct: { type: Number, required: true },
    eligibleCategories: { type: [String], default: [] }, // ← was eligibleCategory: String
    image: { type: String, default: "" },
    available: { type: Boolean, default: true },

    // static-only
    originalPrice: { type: Number },
    offerPrice: { type: Number },
    fixedItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        qty: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Bundle", BundleSchema);
