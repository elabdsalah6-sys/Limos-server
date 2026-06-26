const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: { type: String, required: true },
  selectedSize: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

// A single line on the order representing one bundle purchase.
// `items` holds the flattened products inside the bundle (for receipts /
// stock-keeping), while the top-level fields hold the bundle's own pricing
// so admins can see "Mix of 3: 100 EGP -> 90 EGP (10% off)" without having
// to re-derive it from the nested items.
const orderBundleSchema = new mongoose.Schema({
  bundleId: { type: mongoose.Schema.Types.ObjectId, ref: "Bundle" },
  name: { type: String, required: true },
  originalPrice: { type: Number, required: true }, // subtotal before discount
  discountPct: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  finalPrice: { type: Number, required: true }, // subtotal after discount
  items: [orderItemSchema],
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    guestInfo: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      secondaryPhone: { type: String, default: null },
    },
    checkoutPhone: { type: String },
    items: [orderItemSchema],
    bundles: [orderBundleSchema],
    totalPrice: { type: Number, required: true },

    fulfillmentType: {
      type: String,
      enum: ["delivery", "pickup"],
      required: true,
      default: "delivery",
    },

    notes: { type: String, default: "" },

    deliveryAddress: {
      type: String,
      required: function () {
        return this.fulfillmentType === "delivery";
      },
    },

    deliveryRegion: {
      name: { type: String },
      price: { type: Number, default: 0 },
    },

    pickupLocation: {
      name: { type: String },
      address: { type: String },
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "on_the_way",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "instapay"],
      default: "cash",
    },
    senderInstapayNumber: { type: String, default: null },
    discountCode: { type: String, default: null },
    discountSavings: { type: Number, default: 0 },
  },
  { timestamps: true },
);

orderSchema.pre("validate", function () {
  if (this.fulfillmentType === "pickup") {
    this.deliveryRegion = { name: "Tanta", price: 0 };
  }
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
