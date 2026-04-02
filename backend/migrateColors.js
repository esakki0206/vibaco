require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const Product = require('./src/models/Product');

async function migrate() {
  console.log('Connecting to database...');
  await connectDB();
  
  // Find all products that have variants
  const products = await Product.find({ 'variants.0': { $exists: true } });
  console.log(`Found ${products.length} products with variants.`);
  
  let updatedCount = 0;
  for (const product of products) {
    let changed = false;
    
    // Extract unique colors from variants
    const variantColors = product.variants.map(v => v.colorName).filter(Boolean);
    const uniqueVariantColors = [...new Set(variantColors)];
    
    if (uniqueVariantColors.length > 0) {
      const existingColors = product.colors || [];
      const newColors = [...new Set([...existingColors, ...uniqueVariantColors])];
      
      if (newColors.length !== existingColors.length) {
        product.colors = newColors;
        changed = true;
      }
    }
    
    // Update stock if it is 0 but variants have stock
    const variantStock = product.variants.reduce((total, v) => total + (v.stock || 0), 0);
    if (variantStock > 0 && (product.stock === 0 || !product.stock)) {
      product.stock = variantStock;
      changed = true;
    }
    
    if (changed || product.variants.length > 0) {
        // Also clear out the variants array so they don't get processed again?
        // Or leave them just in case. They are no longer shown in UI.
        
        // Let's explicitly save the new colors and stock.
        await product.save();
        updatedCount++;
    }
  }
  
  console.log(`Migration complete. Updated ${updatedCount} products.`);
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
