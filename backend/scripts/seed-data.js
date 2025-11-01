const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedData() {
  try {
    console.log('🌱 Starting to seed sample data...\n');

    // 1. Create Categories
    console.log('📁 Creating categories...');
    
    // Main categories (Level 1)
    const businessCards = await query(
      `INSERT INTO categories (name, slug, parent_id, level, is_active, created_at)
       VALUES ('Business Cards', 'business-cards', NULL, 1, true, NOW())
       RETURNING id, name`,
      []
    );
    const businessCardsId = businessCards.rows[0].id;
    console.log(`✅ Created: ${businessCards.rows[0].name} (ID: ${businessCardsId})`);

    const flyers = await query(
      `INSERT INTO categories (name, slug, parent_id, level, is_active, created_at)
       VALUES ('Flyers & Brochures', 'flyers-brochures', NULL, 1, true, NOW())
       RETURNING id, name`,
      []
    );
    const flyersId = flyers.rows[0].id;
    console.log(`✅ Created: ${flyers.rows[0].name} (ID: ${flyersId})`);

    const posters = await query(
      `INSERT INTO categories (name, slug, parent_id, level, is_active, created_at)
       VALUES ('Posters & Banners', 'posters-banners', NULL, 1, true, NOW())
       RETURNING id, name`,
      []
    );
    const postersId = posters.rows[0].id;
    console.log(`✅ Created: ${posters.rows[0].name} (ID: ${postersId})`);

    const letterheads = await query(
      `INSERT INTO categories (name, slug, parent_id, level, is_active, created_at)
       VALUES ('Letterheads & Envelopes', 'letterheads-envelopes', NULL, 1, true, NOW())
       RETURNING id, name`,
      []
    );
    const letterheadsId = letterheads.rows[0].id;
    console.log(`✅ Created: ${letterheads.rows[0].name} (ID: ${letterheadsId})`);

    // Sub-categories (Level 2) for Business Cards
    const standardCards = await query(
      `INSERT INTO categories (name, slug, parent_id, level, is_active, created_at)
       VALUES ('Standard Business Cards', 'standard-business-cards', $1, 2, true, NOW())
       RETURNING id, name`,
      [businessCardsId]
    );
    console.log(`✅ Created: ${standardCards.rows[0].name}`);

    const premiumCards = await query(
      `INSERT INTO categories (name, slug, parent_id, level, is_active, created_at)
       VALUES ('Premium Business Cards', 'premium-business-cards', $1, 2, true, NOW())
       RETURNING id, name`,
      [businessCardsId]
    );
    console.log(`✅ Created: ${premiumCards.rows[0].name}`);

    // Sub-categories for Flyers
    const singleFlyers = await query(
      `INSERT INTO categories (name, slug, parent_id, level, is_active, created_at)
       VALUES ('Single Sided Flyers', 'single-sided-flyers', $1, 2, true, NOW())
       RETURNING id, name`,
      [flyersId]
    );
    console.log(`✅ Created: ${singleFlyers.rows[0].name}`);

    const doubleFlyers = await query(
      `INSERT INTO categories (name, slug, parent_id, level, is_active, created_at)
       VALUES ('Double Sided Flyers', 'double-sided-flyers', $1, 2, true, NOW())
       RETURNING id, name`,
      [flyersId]
    );
    console.log(`✅ Created: ${doubleFlyers.rows[0].name}`);

    console.log('\n📦 Creating products...\n');

    // 2. Create Products with Images
    const products = [
      {
        name: 'Premium Business Cards - Matte Finish',
        category_id: premiumCards.rows[0].id,
        description: 'High-quality premium business cards with matte finish. Perfect for professional networking. Available in various paper stocks.',
        price: 500.00,
        image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
        specifications: JSON.stringify({
          paperSize: ['89mm x 51mm'],
          colorMode: ['Color', 'Grayscale'],
          finish: ['Matte', 'Glossy'],
          paperStock: ['300 GSM', '350 GSM'],
          quantity: ['100', '250', '500', '1000']
        })
      },
      {
        name: 'Standard Business Cards - Glossy',
        category_id: standardCards.rows[0].id,
        description: 'Standard business cards with glossy finish. Budget-friendly option with excellent print quality.',
        price: 250.00,
        image_url: 'https://images.unsplash.com/photo-1544966503-7cc606d4e0fa?w=800&h=600&fit=crop',
        specifications: JSON.stringify({
          paperSize: ['89mm x 51mm'],
          colorMode: ['Color', 'Grayscale'],
          finish: ['Glossy'],
          paperStock: ['300 GSM'],
          quantity: ['100', '250', '500']
        })
      },
      {
        name: 'Single Sided A4 Flyers',
        category_id: singleFlyers.rows[0].id,
        description: 'Professional single-sided flyers in A4 size. Ideal for promotions, events, and marketing campaigns.',
        price: 350.00,
        image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
        specifications: JSON.stringify({
          paperSize: ['A4 (210mm x 297mm)'],
          colorMode: ['Color'],
          finish: ['Glossy', 'Matte'],
          paperStock: ['150 GSM', '200 GSM'],
          quantity: ['100', '250', '500', '1000']
        })
      },
      {
        name: 'Double Sided A4 Flyers',
        category_id: doubleFlyers.rows[0].id,
        description: 'Double-sided A4 flyers with printing on both sides. Maximize your marketing space.',
        price: 600.00,
        image_url: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&h=600&fit=crop',
        specifications: JSON.stringify({
          paperSize: ['A4 (210mm x 297mm)'],
          colorMode: ['Color'],
          finish: ['Glossy', 'Matte'],
          paperStock: ['150 GSM', '200 GSM'],
          quantity: ['100', '250', '500', '1000']
        })
      },
      {
        name: 'A3 Posters',
        category_id: postersId,
        description: 'Eye-catching A3 size posters. Perfect for events, promotions, and advertising displays.',
        price: 450.00,
        image_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
        specifications: JSON.stringify({
          paperSize: ['A3 (297mm x 420mm)'],
          colorMode: ['Color'],
          finish: ['Glossy', 'Matte'],
          paperStock: ['200 GSM', '250 GSM'],
          quantity: ['50', '100', '250', '500']
        })
      },
      {
        name: 'Large Format Banners',
        category_id: postersId,
        description: 'Large format banners for outdoor and indoor display. Durable and weather-resistant options available.',
        price: 1200.00,
        image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
        specifications: JSON.stringify({
          paperSize: ['Custom sizes available'],
          colorMode: ['Color'],
          finish: ['Glossy', 'Matte', 'Vinyl'],
          material: ['Paper', 'Vinyl', 'Canvas'],
          quantity: ['1', '5', '10']
        })
      },
      {
        name: 'Company Letterheads',
        category_id: letterheadsId,
        description: 'Professional letterheads with your company branding. Available with matching envelopes.',
        price: 800.00,
        image_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop',
        specifications: JSON.stringify({
          paperSize: ['A4 (210mm x 297mm)'],
          colorMode: ['Color', 'Black & White'],
          finish: ['Matte', 'Bond'],
          paperStock: ['100 GSM', '120 GSM'],
          quantity: ['250', '500', '1000']
        })
      },
      {
        name: 'Matching Envelopes',
        category_id: letterheadsId,
        description: 'Professional envelopes to match your letterheads. Available in standard sizes.',
        price: 400.00,
        image_url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop',
        specifications: JSON.stringify({
          paperSize: ['DL (110mm x 220mm)', 'C4 (229mm x 324mm)'],
          colorMode: ['Color', 'White'],
          finish: ['Matte'],
          paperStock: ['100 GSM', '120 GSM'],
          quantity: ['100', '250', '500']
        })
      }
    ];

    for (const product of products) {
      const result = await query(
        `INSERT INTO products (name, category_id, description, price, image_url, specifications, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
         RETURNING id, name`,
        [product.name, product.category_id, product.description, product.price, product.image_url, product.specifications]
      );
      console.log(`✅ Created: ${result.rows[0].name} - ₹${product.price} [Image: ${product.image_url ? 'Yes' : 'No'}]`);
    }

    console.log('\n✅ Sample data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories created: 8 (4 main + 4 sub-categories)`);
    console.log(`   - Products created: ${products.length}`);
    console.log('\n🎉 You can now view these in the customer section!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

seedData();

