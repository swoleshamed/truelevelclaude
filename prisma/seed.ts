// ===========================================
// FILE: prisma/seed.ts
// PURPOSE: Seed database with reference data for TrueLevel
// PRD REFERENCE: Technical Spec - Reference Data
// Run with: npm run db:seed
// ===========================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // =========================================
  // INJECTOR TYPES
  // =========================================
  console.log('📊 Seeding Injector Types...');

  // Hydroflex Injectors
  const hydroflexInjectors = [
    { system: 'HYDROFLEX', name: 'White', gpm: 0.25, displayOrder: 1 },
    { system: 'HYDROFLEX', name: 'Yellow', gpm: 0.50, displayOrder: 2 },
    { system: 'HYDROFLEX', name: 'Tan', gpm: 0.75, displayOrder: 3 },
    { system: 'HYDROFLEX', name: 'Red', gpm: 1.00, displayOrder: 4 },
    { system: 'HYDROFLEX', name: 'Orange', gpm: 1.50, displayOrder: 5 },
    { system: 'HYDROFLEX', name: 'Gray', gpm: 2.00, displayOrder: 6 },
    { system: 'HYDROFLEX', name: 'Blue', gpm: 2.25, displayOrder: 7 },
    { system: 'HYDROFLEX', name: 'Light Blue', gpm: 3.00, displayOrder: 8 },
    { system: 'HYDROFLEX', name: 'Light Green', gpm: 3.25, displayOrder: 9 },
    { system: 'HYDROFLEX', name: 'Pink', gpm: 3.75, displayOrder: 10 },
    { system: 'HYDROFLEX', name: 'Purple', gpm: 4.50, displayOrder: 11 },
    { system: 'HYDROFLEX', name: 'Dark Green', gpm: 5.50, displayOrder: 12 },
    { system: 'HYDROFLEX', name: 'Black (8.0)', gpm: 8.00, displayOrder: 13 },
    { system: 'HYDROFLEX', name: 'Black (10.0)', gpm: 10.00, displayOrder: 14 },
    { system: 'HYDROFLEX', name: 'Black (12.0)', gpm: 12.00, displayOrder: 15 },
    { system: 'HYDROFLEX', name: 'Black (15.0)', gpm: 15.00, displayOrder: 16 },
  ];

  // Hydrominder Injectors
  const hydrominderInjectors = [
    { system: 'HYDROMINDER', name: '515', gpm: 1.50, displayOrder: 17 },
    { system: 'HYDROMINDER', name: 'E Gap 5111', gpm: 3.50, displayOrder: 18 },
    { system: 'HYDROMINDER', name: '511', gpm: 4.50, displayOrder: 19 },
    { system: 'HYDROMINDER', name: '532', gpm: 6.00, displayOrder: 20 },
    { system: 'HYDROMINDER', name: '530', gpm: 9.00, displayOrder: 21 },
    { system: 'HYDROMINDER', name: '546/551', gpm: 18.00, displayOrder: 22 },
    { system: 'HYDROMINDER', name: '560/565', gpm: 25.00, displayOrder: 23 },
  ];

  const allInjectors = [...hydroflexInjectors, ...hydrominderInjectors];

  for (const injector of allInjectors) {
    await prisma.injectorType.upsert({
      where: {
        // Create a unique identifier using system + name
        id: `${injector.system.toLowerCase()}-${injector.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      },
      update: {},
      create: injector,
    });
  }

  console.log(`✅ Created ${allInjectors.length} injector types\n`);

  // =========================================
  // TIP TYPES
  // =========================================
  console.log('📊 Seeding Tip Types...');

  // Standard Tips
  const standardTips = [
    'Copper', 'Pumpkin', 'Burgundy', 'Lime', 'Tan', 'Orange', 'Turquoise',
    'Pink', 'Light Blue', 'Brown', 'Red', 'White', 'Green', 'Blue',
    'Yellow', 'Black', 'Purple', 'Gray'
  ].map((name, index) => ({
    category: 'STANDARD',
    name,
    displayOrder: index + 1,
  }));

  // Hydrominder Tips
  const hydrominderTips = [
    'Beige', 'Dk. Blue', 'Yellow', 'Aqua', 'Precision',
    'Lt. Purple', 'Olive', 'Red Purple', 'Lt. Orange'
  ].map((name, index) => ({
    category: 'HYDROMINDER',
    name,
    displayOrder: standardTips.length + index + 1,
  }));

  // Dial Tips (1-32)
  const dialTips = Array.from({ length: 32 }, (_, i) => ({
    category: 'DIAL',
    name: `Dial ${i + 1}`,
    displayOrder: standardTips.length + hydrominderTips.length + i + 1,
  }));

  const allTips = [...standardTips, ...hydrominderTips, ...dialTips];

  for (const tip of allTips) {
    await prisma.tipType.upsert({
      where: {
        id: `${tip.category.toLowerCase()}-${tip.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      },
      update: {},
      create: tip,
    });
  }

  console.log(`✅ Created ${allTips.length} tip types\n`);

  // =========================================
  // INCH-GALLON CONVERSIONS
  // =========================================
  console.log('📊 Seeding Inch-Gallon Conversions...');

  // 5 Gallon Pail
  const pail5Conversions = [
    { containerType: 'PAIL_5GAL', inches: 2.5, gallons: 1 },
    { containerType: 'PAIL_5GAL', inches: 5.1, gallons: 2 },
    { containerType: 'PAIL_5GAL', inches: 7.5, gallons: 3 },
    { containerType: 'PAIL_5GAL', inches: 10.0, gallons: 4 },
    { containerType: 'PAIL_5GAL', inches: 12.6, gallons: 5 },
  ];

  // 15 Gallon Drum
  const drum15Conversions = [
    { containerType: 'DRUM_15GAL', inches: 1.4, gallons: 1 },
    { containerType: 'DRUM_15GAL', inches: 2.9, gallons: 2 },
    { containerType: 'DRUM_15GAL', inches: 4.2, gallons: 3 },
    { containerType: 'DRUM_15GAL', inches: 5.8, gallons: 4 },
    { containerType: 'DRUM_15GAL', inches: 7.2, gallons: 5 },
    { containerType: 'DRUM_15GAL', inches: 8.6, gallons: 6 },
    { containerType: 'DRUM_15GAL', inches: 10.0, gallons: 7 },
    { containerType: 'DRUM_15GAL', inches: 11.4, gallons: 8 },
    { containerType: 'DRUM_15GAL', inches: 12.9, gallons: 9 },
    { containerType: 'DRUM_15GAL', inches: 14.3, gallons: 10 },
    { containerType: 'DRUM_15GAL', inches: 15.8, gallons: 11 },
    { containerType: 'DRUM_15GAL', inches: 17.2, gallons: 12 },
    { containerType: 'DRUM_15GAL', inches: 18.6, gallons: 13 },
    { containerType: 'DRUM_15GAL', inches: 20.0, gallons: 14 },
    { containerType: 'DRUM_15GAL', inches: 21.5, gallons: 15 },
  ];

  // 30 Gallon Drum
  const drum30Conversions = [
    { containerType: 'DRUM_30GAL', inches: 0.8, gallons: 1 },
    { containerType: 'DRUM_30GAL', inches: 1.7, gallons: 2 },
    { containerType: 'DRUM_30GAL', inches: 2.6, gallons: 3 },
    { containerType: 'DRUM_30GAL', inches: 3.5, gallons: 4 },
    { containerType: 'DRUM_30GAL', inches: 4.3, gallons: 5 },
    { containerType: 'DRUM_30GAL', inches: 5.2, gallons: 6 },
    { containerType: 'DRUM_30GAL', inches: 6.1, gallons: 7 },
    { containerType: 'DRUM_30GAL', inches: 6.9, gallons: 8 },
    { containerType: 'DRUM_30GAL', inches: 7.8, gallons: 9 },
    { containerType: 'DRUM_30GAL', inches: 8.7, gallons: 10 },
    { containerType: 'DRUM_30GAL', inches: 9.6, gallons: 11 },
    { containerType: 'DRUM_30GAL', inches: 10.4, gallons: 12 },
    { containerType: 'DRUM_30GAL', inches: 11.3, gallons: 13 },
    { containerType: 'DRUM_30GAL', inches: 12.2, gallons: 14 },
    { containerType: 'DRUM_30GAL', inches: 13.0, gallons: 15 },
    { containerType: 'DRUM_30GAL', inches: 13.9, gallons: 16 },
    { containerType: 'DRUM_30GAL', inches: 14.8, gallons: 17 },
    { containerType: 'DRUM_30GAL', inches: 15.6, gallons: 18 },
    { containerType: 'DRUM_30GAL', inches: 16.5, gallons: 19 },
    { containerType: 'DRUM_30GAL', inches: 17.4, gallons: 20 },
    { containerType: 'DRUM_30GAL', inches: 18.2, gallons: 21 },
    { containerType: 'DRUM_30GAL', inches: 19.1, gallons: 22 },
    { containerType: 'DRUM_30GAL', inches: 20.0, gallons: 23 },
    { containerType: 'DRUM_30GAL', inches: 20.8, gallons: 24 },
    { containerType: 'DRUM_30GAL', inches: 21.7, gallons: 25 },
    { containerType: 'DRUM_30GAL', inches: 22.6, gallons: 26 },
    { containerType: 'DRUM_30GAL', inches: 23.5, gallons: 27 },
    { containerType: 'DRUM_30GAL', inches: 24.3, gallons: 28 },
    { containerType: 'DRUM_30GAL', inches: 25.1, gallons: 29 },
    { containerType: 'DRUM_30GAL', inches: 26.0, gallons: 30 },
  ];

  // 55 Gallon Drum
  const drum55Conversions = [
    { containerType: 'DRUM_55GAL', inches: 0.6, gallons: 1 },
    { containerType: 'DRUM_55GAL', inches: 2.9, gallons: 5 },
    { containerType: 'DRUM_55GAL', inches: 5.7, gallons: 10 },
    { containerType: 'DRUM_55GAL', inches: 8.6, gallons: 15 },
    { containerType: 'DRUM_55GAL', inches: 11.4, gallons: 20 },
    { containerType: 'DRUM_55GAL', inches: 14.3, gallons: 25 },
    { containerType: 'DRUM_55GAL', inches: 17.2, gallons: 30 },
    { containerType: 'DRUM_55GAL', inches: 20.0, gallons: 35 },
    { containerType: 'DRUM_55GAL', inches: 22.9, gallons: 40 },
    { containerType: 'DRUM_55GAL', inches: 25.8, gallons: 45 },
    { containerType: 'DRUM_55GAL', inches: 28.6, gallons: 50 },
    { containerType: 'DRUM_55GAL', inches: 31.5, gallons: 55 },
  ];

  const allConversions = [
    ...pail5Conversions,
    ...drum15Conversions,
    ...drum30Conversions,
    ...drum55Conversions,
  ];

  for (const conversion of allConversions) {
    await prisma.inchGallonConversion.upsert({
      where: {
        id: `${conversion.containerType.toLowerCase()}-${conversion.inches}`,
      },
      update: {},
      create: conversion,
    });
  }

  console.log(`✅ Created ${allConversions.length} inch-gallon conversions\n`);

  console.log('✨ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
