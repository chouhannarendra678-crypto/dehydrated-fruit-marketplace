const Category = require('../models/category.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const Seller = require('../models/seller.model');
const User = require('../models/user.model');
const { ROLES, SELLER_STATUS, PRODUCT_STATUS } = require('../constants/roles.constants');

const seedMarketplaceCatalog = async () => {
  try {
    // 1. Seed Categories if empty
    const catCount = await Category.countDocuments();
    let categories = [];
    if (catCount === 0) {
      categories = await Category.create([
        {
          name: 'Tropical Fruits',
          slug: 'tropical-fruits',
          description: 'Sun-dried mango, pineapple rings, papaya spears, and tropical blends.',
          image: {
            url: 'https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=800&q=80',
            publicId: 'cat_tropical',
          },
        },
        {
          name: 'Berries & Cherries',
          slug: 'berries-cherries',
          description: 'Whole dried cranberries, freeze-dried strawberries, blueberries, and cherries.',
          image: {
            url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=800&q=80',
            publicId: 'cat_berries',
          },
        },
        {
          name: 'Figs & Mediterranean',
          slug: 'figs-mediterranean',
          description: 'Royal sun-dried figs (Anjeer), Medjool dates, Turkish apricots, and prunes.',
          image: {
            url: 'https://images.unsplash.com/photo-1595166667555-c42c47432fb8?auto=format&fit=crop&w=800&q=80',
            publicId: 'cat_figs',
          },
        },
        {
          name: 'Citrus & Orchard',
          slug: 'citrus-orchard',
          description: 'Tangy dehydrated green kiwi, cinnamon apple chips, and blood orange crisps.',
          image: {
            url: 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?auto=format&fit=crop&w=800&q=80',
            publicId: 'cat_citrus',
          },
        },
      ]);
      console.log('[Catalog Seeder] Categories created:', categories.length);
    } else {
      categories = await Category.find();
    }

    // 2. Ensure at least two approved sellers exist for multi-vendor comparison
    let sellerA = await Seller.findOne({ storeName: 'Konkan SunDry Naturals' });
    if (!sellerA) {
      let userA = await User.findOne({ email: 'konkan@fruitprocessors.com' });
      if (!userA) {
        userA = await User.create({
          name: 'Ganesh Shinde',
          email: 'konkan@fruitprocessors.com',
          password: 'Password123!',
          phone: '+91 98201 11222',
          role: ROLES.SELLER,
          sellerStatus: SELLER_STATUS.APPROVED,
          isEmailVerified: true,
        });
      }
      sellerA = await Seller.create({
        user: userA._id,
        storeName: 'Konkan SunDry Naturals',
        slug: 'konkan-sundry-naturals',
        description: 'Specialists in naturally sun-dried Ratnagiri Alphonso mangoes and spice-infused dehydrated pineapples.',
        businessInfo: {
          businessName: 'Konkan SunDry Agro Processors LLP',
          businessType: 'LLP',
          pan: 'ABCDE1234F',
          gst: '27ABCDE1234F1Z5',
          fssaiNumber: '12345678901234',
        },
        businessAddress: {
          street: 'Plot 42, MIDC Agro Food Park',
          city: 'Ratnagiri',
          state: 'Maharashtra',
          pincode: '415612',
          country: 'India',
        },
        bankInfo: {
          accountHolderName: 'Konkan SunDry Agro Processors LLP',
          accountNumber: '98765432101234',
          ifscCode: 'HDFC0001234',
          bankName: 'HDFC Bank',
        },
        status: SELLER_STATUS.APPROVED,
        isVerified: true,
        commissionRate: 8,
        rating: 4.9,
        reviewCount: 38,
      });
      console.log('[Catalog Seeder] Created Approved Seller A: Konkan SunDry Naturals');
    }

    let sellerB = await Seller.findOne({ storeName: 'Himalayan Orchard Co.' });
    if (!sellerB) {
      let userB = await User.findOne({ email: 'himalayan@orchards.com' });
      if (!userB) {
        userB = await User.create({
          name: 'Vikas Sharma',
          email: 'himalayan@orchards.com',
          password: 'Password123!',
          phone: '+91 98111 33445',
          role: ROLES.SELLER,
          sellerStatus: SELLER_STATUS.APPROVED,
          isEmailVerified: true,
        });
      }
      sellerB = await Seller.create({
        user: userB._id,
        storeName: 'Himalayan Orchard Co.',
        slug: 'himalayan-orchard-co',
        description: 'High-altitude cold air dehydrated fruits. Zero sugar, no sulfites, directly from Shimla valleys.',
        businessInfo: {
          businessName: 'Himalayan Pure Naturals Pvt Ltd',
          businessType: 'PRIVATE_LIMITED',
          pan: 'FGHIJ5678K',
          gst: '02FGHIJ5678K1Z3',
          fssaiNumber: '98765432109876',
        },
        businessAddress: {
          street: 'Valley Processing Hub, Highway 22',
          city: 'Shimla',
          state: 'Himachal Pradesh',
          pincode: '171001',
          country: 'India',
        },
        bankInfo: {
          accountHolderName: 'Himalayan Pure Naturals Pvt Ltd',
          accountNumber: '11223344556677',
          ifscCode: 'SBIN0001234',
          bankName: 'State Bank of India',
        },
        status: SELLER_STATUS.APPROVED,
        isVerified: true,
        commissionRate: 9,
        rating: 4.8,
        reviewCount: 42,
      });
      console.log('[Catalog Seeder] Created Approved Seller B: Himalayan Orchard Co.');
    }

    // 3. Seed Realistic Dehydrated Fruit Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const tropicalCat = categories.find((c) => c.slug === 'tropical-fruits') || categories[0];
      const berriesCat = categories.find((c) => c.slug === 'berries-cherries') || categories[1];
      const figsCat = categories.find((c) => c.slug === 'figs-mediterranean') || categories[2];
      const citrusCat = categories.find((c) => c.slug === 'citrus-orchard') || categories[3];

      const seedProducts = [
        // Seller A: Dehydrated Mango
        {
          name: 'Ratnagiri Sun-Dried Alphonso Mango Slices',
          category: tropicalCat._id,
          seller: sellerA._id,
          description: 'Authentic Ratnagiri Alphonso mango slices naturally sun-dried without sulphur or preservatives. Rich golden color, intensely sweet, chewy and nutrient-dense with high Vitamin A and fiber.',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=800&q=80',
              publicId: 'prod_alphonso_1',
            },
          ],
          ingredients: ['100% Pure Alphonso Mango'],
          nutrition: { servingSize: '100g', calories: 319, carbohydrates: 78, sugar: 65, protein: 2.5, fiber: 6.8, fat: 0.8 },
          shelfLife: '12 Months',
          storageInstructions: 'Store in airtight container in a cool dry place. Avoid moisture exposure.',
          addedSugar: false,
          preservatives: false,
          status: PRODUCT_STATUS.APPROVED,
          isFeatured: true,
          rating: 4.9,
          reviewCount: 26,
          variantsData: [
            { weight: '100g', price: 180, mrp: 210, SKU: 'KONKAN-MANGO-100G', stock: 120, isDefault: true },
            { weight: '250g', price: 420, mrp: 490, SKU: 'KONKAN-MANGO-250G', stock: 85 },
            { weight: '500g', price: 799, mrp: 950, SKU: 'KONKAN-MANGO-500G', stock: 50 },
            { weight: '1kg', price: 1520, mrp: 1800, SKU: 'KONKAN-MANGO-1KG', stock: 30 },
          ],
        },
        // Seller B: Dehydrated Mango (Comparison product!)
        {
          name: 'Himalayan Golden Dried Mango Chews',
          category: tropicalCat._id,
          seller: sellerB._id,
          description: 'Carefully dehydrated ripe mango slices processed with indirect solar drying. Soft chewy texture with no added sugars or artificial flavor enhancers.',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80',
              publicId: 'prod_mango_himalaya_1',
            },
          ],
          ingredients: ['Dehydrated Ripe Mangoes'],
          nutrition: { servingSize: '100g', calories: 310, carbohydrates: 76, sugar: 62, protein: 2.4, fiber: 7.0, fat: 0.6 },
          shelfLife: '10 Months',
          storageInstructions: 'Seal after opening. Keep away from humid air.',
          addedSugar: false,
          preservatives: false,
          status: PRODUCT_STATUS.APPROVED,
          isFeatured: true,
          rating: 4.7,
          reviewCount: 19,
          variantsData: [
            { weight: '100g', price: 160, mrp: 190, SKU: 'HIM-MANGO-100G', stock: 95, isDefault: true },
            { weight: '250g', price: 380, mrp: 440, SKU: 'HIM-MANGO-250G', stock: 60 },
            { weight: '500g', price: 740, mrp: 850, SKU: 'HIM-MANGO-500G', stock: 40 },
            { weight: '1kg', price: 1400, mrp: 1650, SKU: 'HIM-MANGO-1KG', stock: 25 },
          ],
        },
        // Seller A: Spiced Pineapple Rings
        {
          name: 'Spiced Dehydrated Pineapple Rings',
          category: tropicalCat._id,
          seller: sellerA._id,
          description: 'Thick pineapple slices dehydrated at low temperature and dusted with natural rock salt and black pepper for a sweet, sour, and tangy punch.',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?auto=format&fit=crop&w=800&q=80',
              publicId: 'prod_pineapple_1',
            },
          ],
          ingredients: ['Dehydrated Pineapple', 'Rock Salt', 'Black Pepper'],
          nutrition: { servingSize: '100g', calories: 295, carbohydrates: 73, sugar: 58, protein: 1.8, fiber: 5.5, fat: 0.4 },
          shelfLife: '12 Months',
          storageInstructions: 'Store in cool ambient dry room.',
          addedSugar: false,
          preservatives: false,
          status: PRODUCT_STATUS.APPROVED,
          isFeatured: false,
          rating: 4.8,
          reviewCount: 14,
          variantsData: [
            { weight: '100g', price: 140, mrp: 170, SKU: 'KONKAN-PINE-100G', stock: 75, isDefault: true },
            { weight: '250g', price: 330, mrp: 390, SKU: 'KONKAN-PINE-250G', stock: 50 },
            { weight: '500g', price: 620, mrp: 720, SKU: 'KONKAN-PINE-500G', stock: 35 },
          ],
        },
        // Seller B: Sun-Dried Cranberries
        {
          name: 'Organic Wild Sun-Dried Cranberries',
          category: berriesCat._id,
          seller: sellerB._id,
          description: 'Whole plump wild cranberries slowly dried to preserve tartness, high proanthocyanidins and antioxidant benefits. Zero refined sugar.',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=800&q=80',
              publicId: 'prod_cranberry_1',
            },
          ],
          ingredients: ['100% Wild Cranberries'],
          nutrition: { servingSize: '100g', calories: 308, carbohydrates: 82, sugar: 65, protein: 1.4, fiber: 5.3, fat: 1.1 },
          shelfLife: '12 Months',
          storageInstructions: 'Refrigerate after opening for peak crispness.',
          addedSugar: false,
          preservatives: false,
          status: PRODUCT_STATUS.APPROVED,
          isFeatured: true,
          rating: 4.9,
          reviewCount: 31,
          variantsData: [
            { weight: '100g', price: 190, mrp: 220, SKU: 'HIM-CRAN-100G', stock: 110, isDefault: true },
            { weight: '250g', price: 450, mrp: 520, SKU: 'HIM-CRAN-250G', stock: 80 },
            { weight: '500g', price: 850, mrp: 990, SKU: 'HIM-CRAN-500G', stock: 45 },
          ],
        },
        // Seller A: Sun-Dried Anjeer (Figs)
        {
          name: 'Royal Sun-Dried Figs (Anjeer)',
          category: figsCat._id,
          seller: sellerA._id,
          description: 'Selected large-caliber figs sun-ripened and dried on traditional mats. Naturally sweet, dense in iron, calcium, and dietary fiber with edible crunchy seeds.',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1595166667555-c42c47432fb8?auto=format&fit=crop&w=800&q=80',
              publicId: 'prod_figs_1',
            },
          ],
          ingredients: ['Whole Sun-Dried Figs'],
          nutrition: { servingSize: '100g', calories: 249, carbohydrates: 64, sugar: 48, protein: 3.3, fiber: 9.8, fat: 0.9 },
          shelfLife: '9 Months',
          storageInstructions: 'Keep in dry air-tight container away from pantry heat.',
          addedSugar: false,
          preservatives: false,
          status: PRODUCT_STATUS.APPROVED,
          isFeatured: false,
          rating: 4.8,
          reviewCount: 22,
          variantsData: [
            { weight: '250g', price: 390, mrp: 460, SKU: 'KONKAN-FIG-250G', stock: 70, isDefault: true },
            { weight: '500g', price: 750, mrp: 880, SKU: 'KONKAN-FIG-500G', stock: 45 },
            { weight: '1kg', price: 1450, mrp: 1700, SKU: 'KONKAN-FIG-1KG', stock: 20 },
          ],
        },
        // Seller B: Dehydrated Kiwi Slices
        {
          name: 'Tangy Dehydrated Green Kiwi Slices',
          category: citrusCat._id,
          seller: sellerB._id,
          description: 'Thinly sliced emerald green kiwis dehydrated at gentle temperatures to protect enzymes and Vitamin C. Zesty, crisp-chewy, and pleasantly tart.',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?auto=format&fit=crop&w=800&q=80',
              publicId: 'prod_kiwi_1',
            },
          ],
          ingredients: ['Dehydrated Kiwi Fruit'],
          nutrition: { servingSize: '100g', calories: 312, carbohydrates: 74, sugar: 55, protein: 3.0, fiber: 7.2, fat: 1.2 },
          shelfLife: '12 Months',
          storageInstructions: 'Seal after opening to prevent moisture absorption.',
          addedSugar: false,
          preservatives: false,
          status: PRODUCT_STATUS.APPROVED,
          isFeatured: false,
          rating: 4.6,
          reviewCount: 17,
          variantsData: [
            { weight: '100g', price: 130, mrp: 160, SKU: 'HIM-KIWI-100G', stock: 80, isDefault: true },
            { weight: '250g', price: 299, mrp: 350, SKU: 'HIM-KIWI-250G', stock: 55 },
            { weight: '500g', price: 570, mrp: 680, SKU: 'HIM-KIWI-500G', stock: 30 },
          ],
        },
      ];

      for (const p of seedProducts) {
        const { variantsData, ...productData } = p;
        const sellerDoc = await Seller.findById(productData.seller);
        const slug = await Product.generateSlug(productData.name, sellerDoc?.storeName || '');

        const createdProduct = await Product.create({
          ...productData,
          slug,
        });

        let minPrice = Infinity;
        let totalStock = 0;
        const variantIds = [];

        for (const v of variantsData) {
          const variant = await ProductVariant.create({
            product: createdProduct._id,
            weight: v.weight,
            price: v.price,
            mrp: v.mrp,
            SKU: v.SKU,
            stock: v.stock,
            isDefault: v.isDefault || false,
          });
          variantIds.push(variant._id);
          if (v.price < minPrice) minPrice = v.price;
          totalStock += v.stock;
        }

        createdProduct.variants = variantIds;
        createdProduct.minPrice = minPrice;
        createdProduct.totalStock = totalStock;
        await createdProduct.save();
      }

      console.log('[Catalog Seeder] Created realistic dehydrated fruit products:', seedProducts.length);
    }
  } catch (error) {
    console.error('[Catalog Seeder Error]:', error.message);
  }
};

module.exports = seedMarketplaceCatalog;
