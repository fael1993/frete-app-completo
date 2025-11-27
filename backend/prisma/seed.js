import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/pt_PT';

const prisma = new PrismaClient();

// Países da Europa para seeds
const EU_COUNTRIES = [
  'Portugal', 'Espanha', 'França', 'Alemanha', 'Itália',
  'Holanda', 'Bélgica', 'Polónia', 'República Checa', 'Áustria'
];

// Cidades principais por país
const CITIES = {
  'Portugal': ['Lisboa', 'Porto', 'Braga', 'Coimbra', 'Faro'],
  'Espanha': ['Madrid', 'Barcelona', 'Valência', 'Sevilha', 'Bilbau'],
  'França': ['Paris', 'Lyon', 'Marselha', 'Toulouse', 'Nice'],
  'Alemanha': ['Berlim', 'Munique', 'Hamburgo', 'Frankfurt', 'Colónia'],
  'Itália': ['Roma', 'Milão', 'Nápoles', 'Turim', 'Florença'],
};

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ============================================
  // 1. LIMPAR DADOS EXISTENTES
  // ============================================
  console.log('🗑️  Limpando dados existentes...');
  
  await prisma.auditLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.load.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Dados limpos com sucesso!\n');

  // ============================================
  // 2. CRIAR USUÁRIOS
  // ============================================
  console.log('👥 Criando usuários...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@boxfreight.eu',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      firstName: 'Admin',
      lastName: 'Sistema',
      phone: '+351912345678',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      gdprConsent: true,
      gdprConsentDate: new Date(),
      companyName: 'BoxFreight EU',
      companyVat: 'PT999999999',
      companyAddress: 'Rua do Comércio, 123',
      companyCity: 'Lisboa',
      companyCountry: 'Portugal',
      companyPostalCode: '1100-000',
    },
  });

  // Embarcadores (Shippers)
  const shippers = [];
  for (let i = 0; i < 5; i++) {
    const shipper = await prisma.user.create({
      data: {
        email: `embarcador${i + 1}@example.com`,
        password: hashedPassword,
        role: 'SHIPPER',
        status: 'ACTIVE',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number('+351 9## ### ###'),
        emailVerified: true,
        emailVerifiedAt: new Date(),
        gdprConsent: true,
        gdprConsentDate: new Date(),
        companyName: faker.company.name(),
        companyVat: `PT${faker.number.int({ min: 100000000, max: 999999999 })}`,
        companyAddress: faker.location.streetAddress(),
        companyCity: faker.helpers.arrayElement(CITIES['Portugal']),
        companyCountry: 'Portugal',
        companyPostalCode: faker.location.zipCode('####-###'),
        averageRating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
        totalRatings: faker.number.int({ min: 5, max: 50 }),
      },
    });
    shippers.push(shipper);
  }

  // Transportadores (Carriers)
  const carriers = [];
  for (let i = 0; i < 8; i++) {
    const country = faker.helpers.arrayElement(EU_COUNTRIES);
    const carrier = await prisma.user.create({
      data: {
        email: `transportador${i + 1}@example.com`,
        password: hashedPassword,
        role: 'CARRIER',
        status: 'ACTIVE',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number('+351 9## ### ###'),
        emailVerified: true,
        emailVerifiedAt: new Date(),
        gdprConsent: true,
        gdprConsentDate: new Date(),
        companyName: faker.company.name() + ' Transportes',
        companyVat: `PT${faker.number.int({ min: 100000000, max: 999999999 })}`,
        companyAddress: faker.location.streetAddress(),
        companyCity: faker.helpers.arrayElement(CITIES[country] || ['Lisboa']),
        companyCountry: country,
        companyPostalCode: faker.location.zipCode('####-###'),
        averageRating: faker.number.float({ min: 3.8, max: 5, fractionDigits: 1 }),
        totalRatings: faker.number.int({ min: 10, max: 100 }),
      },
    });
    carriers.push(carrier);
  }

  console.log(`✅ Criados: 1 Admin, ${shippers.length} Embarcadores, ${carriers.length} Transportadores\n`);

  // ============================================
  // 3. CRIAR VEÍCULOS
  // ============================================
  console.log('🚚 Criando veículos...');

  const vehicles = [];
  const vehicleTypes = ['Camião Rígido', 'Camião Articulado', 'Van', 'Camião Frigorífico'];
  const brands = ['Mercedes', 'Volvo', 'Scania', 'MAN', 'Iveco', 'DAF'];

  for (const carrier of carriers) {
    const numVehicles = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < numVehicles; i++) {
      const hasRefrigeration = faker.datatype.boolean(0.3);
      const vehicle = await prisma.vehicle.create({
        data: {
          ownerId: carrier.id,
          licensePlate: `${faker.string.alpha({ length: 2, casing: 'upper' })-${faker.number.int({ min: 10, max: 99 })}-${faker.string.alpha({ length: 2, casing: 'upper' })}`,
          brand: faker.helpers.arrayElement(brands),
          model: faker.vehicle.model(),
          year: faker.number.int({ min: 2015, max: 2024 }),
          type: faker.helpers.arrayElement(vehicleTypes),
          maxWeight: faker.number.int({ min: 3500, max: 40000 }),
          maxVolume: faker.number.float({ min: 20, max: 100, fractionDigits: 1 }),
          maxPallets: faker.number.int({ min: 10, max: 33 }),
          hasRefrigeration,
          minTemperature: hasRefrigeration ? -20 : null,
          maxTemperature: hasRefrigeration ? 15 : null,
          insuranceExpiry: faker.date.future({ years: 1 }),
          inspectionExpiry: faker.date.future({ years: 1 }),
          licenseExpiry: faker.date.future({ years: 2 }),
          isActive: true,
          isAvailable: faker.datatype.boolean(0.7),
        },
      });
      vehicles.push(vehicle);
    }
  }

  console.log(`✅ Criados ${vehicles.length} veículos\n`);

  // ============================================
  // 4. CRIAR CARGAS
  // ============================================
  console.log('📦 Criando cargas...');

  const loads = [];
  const loadTypes = ['FTL', 'LTL', 'CONTAINER_20', 'CONTAINER_40', 'REFRIGERATED'];
  const loadStatuses = ['PUBLISHED', 'IN_NEGOTIATION', 'ASSIGNED', 'IN_TRANSIT'];

  for (let i = 0; i < 20; i++) {
    const shipper = faker.helpers.arrayElement(shippers);
    const originCountry = faker.helpers.arrayElement(EU_COUNTRIES);
    const destCountry = faker.helpers.arrayElement(EU_COUNTRIES.filter(c => c !== originCountry));
    const type = faker.helpers.arrayElement(loadTypes);
    const requiresRefrigeration = type === 'REFRIGERATED';

    const load = await prisma.load.create({
      data: {
        creatorId: shipper.id,
        title: `Transporte de ${faker.commerce.product()} - ${originCountry} para ${destCountry}`,
        description: faker.lorem.paragraph(),
        type,
        status: faker.helpers.arrayElement(loadStatuses),
        originAddress: faker.location.streetAddress(),
        originCity: faker.helpers.arrayElement(CITIES[originCountry] || ['Lisboa']),
        originCountry,
        originPostalCode: faker.location.zipCode('####-###'),
        originLat: faker.location.latitude({ min: 36, max: 55 }),
        originLng: faker.location.longitude({ min: -10, max: 25 }),
        destAddress: faker.location.streetAddress(),
        destCity: faker.helpers.arrayElement(CITIES[destCountry] || ['Madrid']),
        destCountry,
        destPostalCode: faker.location.zipCode('####-###'),
        destLat: faker.location.latitude({ min: 36, max: 55 }),
        destLng: faker.location.longitude({ min: -10, max: 25 }),
        distance: faker.number.float({ min: 200, max: 3000, fractionDigits: 1 }),
        estimatedDuration: faker.number.int({ min: 180, max: 2880 }),
        pickupDate: faker.date.soon({ days: 7 }),
        deliveryDate: faker.date.soon({ days: 14 }),
        weight: faker.number.int({ min: 500, max: 24000 }),
        volume: faker.number.float({ min: 10, max: 80, fractionDigits: 1 }),
        pallets: faker.number.int({ min: 1, max: 33 }),
        requiresRefrigeration,
        temperature: requiresRefrigeration ? faker.number.int({ min: -18, max: 8 }) : null,
        isHazardous: faker.datatype.boolean(0.1),
        budgetMin: faker.number.int({ min: 500, max: 2000 }),
        budgetMax: faker.number.int({ min: 2000, max: 5000 }),
        requiresInsurance: faker.datatype.boolean(0.6),
        insuranceValue: faker.number.int({ min: 5000, max: 50000 }),
        contactName: `${shipper.firstName} ${shipper.lastName}`,
        contactPhone: shipper.phone || '+351912345678',
        contactEmail: shipper.email,
        views: faker.number.int({ min: 0, max: 150 }),
        publishedAt: new Date(),
      },
    });
    loads.push(load);
  }

  console.log(`✅ Criadas ${loads.length} cargas\n`);

  // ============================================
  // 5. CRIAR OFERTAS
  // ============================================
  console.log('💰 Criando ofertas...');

  const offers = [];
  for (const load of loads.slice(0, 15)) {
    const numOffers = faker.number.int({ min: 1, max: 4 });
    for (let i = 0; i < numOffers; i++) {
      const carrier = faker.helpers.arrayElement(carriers);
      const carrierVehicles = vehicles.filter(v => v.ownerId === carrier.id);
      const vehicle = carrierVehicles.length > 0 ? faker.helpers.arrayElement(carrierVehicles) : null;

      const offer = await prisma.offer.create({
        data: {
          loadId: load.id,
          carrierId: carrier.id,
          vehicleId: vehicle?.id,
          price: faker.number.int({ min: load.budgetMin || 500, max: load.budgetMax || 5000 }),
          estimatedPickup: load.pickupDate,
          estimatedDelivery: load.deliveryDate,
          message: faker.lorem.sentence(),
          status: i === 0 && faker.datatype.boolean(0.5) ? 'ACCEPTED' : 'PENDING',
        },
      });
      offers.push(offer);
    }
  }

  console.log(`✅ Criadas ${offers.length} ofertas\n`);

  // ============================================
  // 6. CRIAR VIAGENS
  // ============================================
  console.log('🚛 Criando viagens...');

  const acceptedOffers = offers.filter(o => o.status === 'ACCEPTED');
  const trips = [];

  for (const offer of acceptedOffers.slice(0, 5)) {
    const load = loads.find(l => l.id === offer.loadId);
    if (!load) continue;

    const trip = await prisma.trip.create({
      data: {
        loadId: load.id,
        offerId: offer.id,
        carrierId: offer.carrierId,
        vehicleId: offer.vehicleId,
        status: faker.helpers.arrayElement(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']),
        scheduledPickup: offer.estimatedPickup,
        actualPickup: faker.date.recent({ days: 2 }),
        scheduledDelivery: offer.estimatedDelivery,
        actualDelivery: faker.datatype.boolean(0.5) ? faker.date.recent({ days: 1 }) : null,
        currentLat: faker.location.latitude({ min: 36, max: 55 }),
        currentLng: faker.location.longitude({ min: -10, max: 25 }),
        lastUpdateAt: new Date(),
      },
    });
    trips.push(trip);
  }

  console.log(`✅ Criadas ${trips.length} viagens\n`);

  // ============================================
  // 7. CRIAR NOTIFICAÇÕES
  // ============================================
  console.log('🔔 Criando notificações...');

  const notificationTypes = ['NEW_LOAD', 'NEW_OFFER', 'OFFER_ACCEPTED', 'TRIP_STARTED', 'TRIP_COMPLETED'];
  let notificationCount = 0;

  for (const user of [...shippers, ...carriers]) {
    const numNotifications = faker.number.int({ min: 2, max: 8 });
    for (let i = 0; i < numNotifications; i++) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: faker.helpers.arrayElement(notificationTypes),
          title: faker.lorem.sentence({ min: 3, max: 6 }),
          message: faker.lorem.sentence(),
          isRead: faker.datatype.boolean(0.6),
          readAt: faker.datatype.boolean(0.6) ? faker.date.recent({ days: 7 }) : null,
        },
      });
      notificationCount++;
    }
  }

  console.log(`✅ Criadas ${notificationCount} notificações\n`);

  // ============================================
  // RESUMO FINAL
  // ============================================
  console.log('\n✨ Seed concluído com sucesso!\n');
  console.log('📊 Resumo:');
  console.log(`   • Usuários: ${shippers.length + carriers.length + 1}`);
  console.log(`   • Veículos: ${vehicles.length}`);
  console.log(`   • Cargas: ${loads.length}`);
  console.log(`   • Ofertas: ${offers.length}`);
  console.log(`   • Viagens: ${trips.length}`);
  console.log(`   • Notificações: ${notificationCount}`);
  console.log('\n🔐 Credenciais de teste:');
  console.log('   Admin:         admin@boxfreight.eu / Password123!');
  console.log('   Embarcador:    embarcador1@example.com / Password123!');
  console.log('   Transportador: transportador1@example.com / Password123!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
