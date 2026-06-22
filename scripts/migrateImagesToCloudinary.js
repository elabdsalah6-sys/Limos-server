require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");

const Product = require("../models/Product");
const Bundle = require("../models/Bundle");

const uploadBase64 = async (base64Str, folder) => {
  const result = await cloudinary.uploader.upload(base64Str, {
    folder,
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  });
  return result.secure_url;
};

const migrate = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const products = await Product.find({ image: { $regex: "^data:image" } });
  console.log(`Found ${products.length} products with base64 images`);

  for (const p of products) {
    try {
      const url = await uploadBase64(p.image, "limos-bakery/products");
      p.image = url;
      await p.save();
      console.log(`✓ Migrated product: ${p.name}`);
    } catch (err) {
      console.error(`✗ Failed for product ${p.name}:`, err.message);
    }
  }

  const bundles = await Bundle.find({ image: { $regex: "^data:image" } });
  console.log(`Found ${bundles.length} bundles with base64 images`);

  for (const b of bundles) {
    try {
      const url = await uploadBase64(b.image, "limos-bakery/bundles");
      b.image = url;
      await b.save();
      console.log(`✓ Migrated bundle: ${b.name}`);
    } catch (err) {
      console.error(`✗ Failed for bundle ${b.name}:`, err.message);
    }
  }

  console.log("Migration complete.");
  await mongoose.disconnect();
};

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
