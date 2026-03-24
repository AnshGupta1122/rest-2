import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const passwordHash = await bcryptjs.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
    },
  });

  // Create categories
  const starters = await prisma.category.create({
    data: { name: 'Starters', description: 'Delicious appetizers to begin your meal', sortOrder: 1, image: '🥗' },
  });
  const mains = await prisma.category.create({
    data: { name: 'Main Course', description: 'Hearty main dishes', sortOrder: 2, image: '🍛' },
  });
  const breads = await prisma.category.create({
    data: { name: 'Breads', description: 'Fresh baked breads', sortOrder: 3, image: '🫓' },
  });
  const beverages = await prisma.category.create({
    data: { name: 'Beverages', description: 'Refreshing drinks', sortOrder: 4, image: '🥤' },
  });
  const desserts = await prisma.category.create({
    data: { name: 'Desserts', description: 'Sweet treats to end your meal', sortOrder: 5, image: '🍮' },
  });

  // Create menu items
  const items = [
    // Starters
    { name: 'Paneer Tikka', description: 'Marinated cottage cheese cubes grilled to perfection', price: 249, categoryId: starters.id, isVeg: true, isFeatured: true },
    { name: 'Chicken Seekh Kebab', description: 'Minced chicken with aromatic spices on skewers', price: 299, categoryId: starters.id, isVeg: false, isFeatured: true },
    { name: 'Veg Spring Rolls', description: 'Crispy rolls filled with fresh vegetables', price: 199, categoryId: starters.id, isVeg: true },
    { name: 'Fish Amritsari', description: 'Crispy battered fish with tangy chutney', price: 349, categoryId: starters.id, isVeg: false },
    { name: 'Hara Bhara Kebab', description: 'Spinach and green pea cutlets with mint', price: 219, categoryId: starters.id, isVeg: true },
    // Main Course
    { name: 'Butter Chicken', description: 'Tender chicken in rich creamy tomato gravy', price: 349, categoryId: mains.id, isVeg: false, isFeatured: true },
    { name: 'Dal Makhani', description: 'Slow-cooked black lentils in buttery gravy', price: 249, categoryId: mains.id, isVeg: true, isFeatured: true },
    { name: 'Palak Paneer', description: 'Cottage cheese cubes in creamy spinach sauce', price: 269, categoryId: mains.id, isVeg: true },
    { name: 'Chicken Biryani', description: 'Fragrant basmati rice with spiced chicken', price: 329, categoryId: mains.id, isVeg: false, isFeatured: true },
    { name: 'Paneer Butter Masala', description: 'Paneer in a velvety butter-tomato sauce', price: 279, categoryId: mains.id, isVeg: true },
    { name: 'Mutton Rogan Josh', description: 'Kashmiri-style slow-cooked lamb curry', price: 449, categoryId: mains.id, isVeg: false },
    { name: 'Veg Biryani', description: 'Aromatic basmati rice with seasonal vegetables', price: 249, categoryId: mains.id, isVeg: true },
    // Breads
    { name: 'Butter Naan', description: 'Soft leavened bread brushed with butter', price: 59, categoryId: breads.id, isVeg: true },
    { name: 'Garlic Naan', description: 'Naan topped with roasted garlic', price: 69, categoryId: breads.id, isVeg: true },
    { name: 'Tandoori Roti', description: 'Whole wheat bread from the clay oven', price: 39, categoryId: breads.id, isVeg: true },
    { name: 'Laccha Paratha', description: 'Flaky layered whole wheat bread', price: 59, categoryId: breads.id, isVeg: true },
    // Beverages
    { name: 'Masala Chai', description: 'Indian spiced tea with milk', price: 49, categoryId: beverages.id, isVeg: true },
    { name: 'Mango Lassi', description: 'Refreshing yogurt-based mango smoothie', price: 99, categoryId: beverages.id, isVeg: true, isFeatured: true },
    { name: 'Fresh Lime Soda', description: 'Sparkling lime drink, sweet or salty', price: 79, categoryId: beverages.id, isVeg: true },
    { name: 'Cold Coffee', description: 'Creamy iced coffee blend', price: 129, categoryId: beverages.id, isVeg: true },
    // Desserts
    { name: 'Gulab Jamun', description: 'Deep-fried milk balls soaked in rose syrup', price: 99, categoryId: desserts.id, isVeg: true, isFeatured: true },
    { name: 'Rasmalai', description: 'Soft cottage cheese dumplings in cardamom milk', price: 129, categoryId: desserts.id, isVeg: true },
    { name: 'Kulfi', description: 'Traditional Indian frozen dessert', price: 89, categoryId: desserts.id, isVeg: true },
    { name: 'Brownie with Ice Cream', description: 'Warm chocolate brownie with vanilla ice cream', price: 179, categoryId: desserts.id, isVeg: true },
  ];

  for (const item of items) {
    await prisma.menuItem.create({ data: item });
  }

  // Create default settings
  const settings = [
    { key: 'restaurant_name', value: 'Spice Garden' },
    { key: 'restaurant_tagline', value: 'Authentic Indian Cuisine' },
    { key: 'restaurant_phone', value: '+91 98765 43210' },
    { key: 'restaurant_address', value: '123 Food Street, Mumbai, India' },
    { key: 'upi_id', value: 'anshg8831-1@oksbi' },
    { key: 'upi_qr_data', value: 'upi://pay?pa=anshg8831-1@oksbi&pn=Ansh gupta' },
  ];

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
