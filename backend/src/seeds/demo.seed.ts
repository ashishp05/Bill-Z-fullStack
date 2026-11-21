// Demo data for design verification and local API testing.
// Run with: npm run db:seed   (idempotent: demo vendors and customers are rebuilt each run)
// Mirrors website/src/data/demo.json so the PWA looks the same in mock and API mode.
import bcrypt from 'bcrypt';

import { env } from '../config/env-config';
import { PrismaService } from '../config/prisma.config';
import { BCRYPT_SALT_ROUNDS } from '../constants/config.constants';
import { CustomerRepository } from '../features/customer/repositories/customer.repository';
import { CustomerService } from '../features/customer/services/customer.service';
import { InvoiceRepository } from '../features/invoice/repositories/invoice.repository';
import { InvoiceService } from '../features/invoice/services/invoice.service';
import { addDays, formatDateOnly, todayDateOnly } from '../utils/date.util';

const prismaService = PrismaService.getInstance();
const prisma = prismaService.client;
const customerService = new CustomerService(new CustomerRepository(prisma));
const invoiceService = new InvoiceService(new InvoiceRepository(prisma));

export const DEMO_ADMIN = {
  name: 'Bill-Z Super Admin',
  email: 'admin@billz.dev',
  password: 'Admin@12345',
};

const CATEGORIES = [
  'Kitchen',
  'Drinkware',
  'Home Appliances',
  'Electronics',
  'Stationery',
  'Other',
];
const BRANDS = [
  'Havells',
  'Milton',
  'Bajaj',
  'Prestige',
  'Philips',
  'Borosil',
  'Classmate',
  'Generic',
];

interface DemoProduct {
  name: string;
  sku: string;
  price: number;
  gstRate: number;
  hsn: string;
  category: string;
  brand: string;
  description: string;
  active?: boolean;
}

interface DemoCustomer {
  name: string;
  email: string;
  phone: string;
  gstin?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface DemoInvoice {
  customer: string;
  daysAgo: number;
  termsDays: number;
  items: [sku: string, quantity: number][];
  discount?: number;
  paid?: { mode: string; afterDays: number };
}

interface DemoVendor {
  vendor: {
    firstName: string;
    lastName: string;
    email: string;
    businessName: string;
    businessType: string;
    gstin: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    upiId: string;
  };
  settings: { invoicePrefix: string; invoiceNote: string };
  products: DemoProduct[];
  customers: DemoCustomer[];
  invoices: DemoInvoice[];
}

const aarav: DemoCustomer = {
  name: 'Aarav Mehta',
  email: 'aarav.mehta@gmail.com',
  phone: '+91 98765 43210',
  address: '24, Park View Society, Navrangpura',
  city: 'Ahmedabad',
  state: 'Gujarat',
  pincode: '380009',
};

const DEMO_VENDORS: DemoVendor[] = [
  {
    vendor: {
      firstName: 'Rohan',
      lastName: 'Mehta',
      email: 'rohan@mehtatraders.in',
      businessName: 'Mehta Traders',
      businessType: 'Retail & trading',
      gstin: '24ABCDE1234F1Z5',
      phoneNumber: '+91 98250 12345',
      address: 'Shop 12, CG Road, Navrangpura',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380009',
      upiId: 'mehtatraders@upi',
    },
    settings: {
      invoicePrefix: 'BZ-2026-',
      invoiceNote: 'Thank you for shopping with Mehta Traders.',
    },
    products: [
      {
        name: 'Electric Kettle',
        sku: 'KIT-001',
        price: 1800,
        gstRate: 18,
        hsn: '85167920',
        category: 'Kitchen',
        brand: 'Havells',
        description:
          '1.5 L stainless steel electric kettle with auto shut-off and a 360° swivel base.',
      },
      {
        name: 'Steel Flask',
        sku: 'KIT-002',
        price: 800,
        gstRate: 18,
        hsn: '96170012',
        category: 'Drinkware',
        brand: 'Milton',
        description: 'Double-wall stainless steel flask. Keeps your drinks hot or cold on the go.',
      },
      {
        name: 'Pop-up Toaster',
        sku: 'KIT-003',
        price: 2200,
        gstRate: 18,
        hsn: '85167200',
        category: 'Kitchen',
        brand: 'Bajaj',
        description: 'Two-slice toaster with variable browning control and a removable crumb tray.',
      },
      {
        name: 'Pressure Cooker 5 L',
        sku: 'KIT-004',
        price: 2450,
        gstRate: 12,
        hsn: '76151030',
        category: 'Kitchen',
        brand: 'Prestige',
        description: 'Aluminium outer-lid pressure cooker with gasket release safety valve.',
      },
      {
        name: 'Glass Water Bottle Set (3)',
        sku: 'DRK-005',
        price: 899,
        gstRate: 18,
        hsn: '70133700',
        category: 'Drinkware',
        brand: 'Borosil',
        description: 'Set of three 1 L borosilicate glass bottles with steel caps.',
      },
      {
        name: 'Ruled Notebook (Pack of 6)',
        sku: 'STN-006',
        price: 360,
        gstRate: 12,
        hsn: '48202000',
        category: 'Stationery',
        brand: 'Classmate',
        description: 'A4 single-line notebooks, 172 pages each.',
      },
      {
        name: 'Ceiling Fan (Discontinued)',
        sku: 'APP-007',
        price: 3100,
        gstRate: 18,
        hsn: '84145110',
        category: 'Home Appliances',
        brand: 'Havells',
        description: 'Inactive product: hidden from the invoice product picker.',
        active: false,
      },
    ],
    customers: [
      aarav,
      {
        name: 'Diya Patel',
        email: 'diya.patel@gmail.com',
        phone: '+91 98250 12341',
        address: '8, Shanti Kunj, Adajan',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395009',
      },
      {
        name: 'Rohan Shah',
        email: 'rohan.shah@gmail.com',
        phone: '+91 98200 12342',
        address: '501, Sea Breeze Apartments, Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053',
      },
      {
        name: 'Neha Joshi (Joshi Enterprises)',
        email: 'neha.joshi@gmail.com',
        phone: '+91 98250 12343',
        gstin: '24AAFCJ5678K1Z2',
        address: 'B-14, Alkapuri Business Hub, Alkapuri',
        city: 'Vadodara',
        state: 'Gujarat',
        pincode: '390007',
      },
      {
        name: 'Kabir Rao',
        email: 'kabir.rao@gmail.com',
        phone: '+91 98450 12344',
        address: '17, 4th Cross, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
      },
    ],
    invoices: [
      // Paid, intra-state (CGST + SGST)
      {
        customer: 'diya.patel@gmail.com',
        daysAgo: 36,
        termsDays: 7,
        items: [
          ['KIT-003', 2],
          ['KIT-002', 7],
        ],
        paid: { mode: 'UPI', afterDays: 2 },
      },
      // Paid, inter-state (IGST), mixed GST rates
      {
        customer: 'rohan.shah@gmail.com',
        daysAgo: 30,
        termsDays: 7,
        items: [
          ['KIT-004', 1],
          ['STN-006', 2],
        ],
        paid: { mode: 'Bank transfer', afterDays: 5 },
      },
      // Overdue: pending and past the due date
      {
        customer: 'aarav.mehta@gmail.com',
        daysAgo: 20,
        termsDays: 7,
        items: [
          ['DRK-005', 1],
          ['STN-006', 3],
        ],
      },
      // Paid, B2B customer with GSTIN, with a discount
      {
        customer: 'neha.joshi@gmail.com',
        daysAgo: 12,
        termsDays: 15,
        items: [
          ['KIT-001', 5],
          ['DRK-005', 4],
        ],
        discount: 500,
        paid: { mode: 'Cash', afterDays: 1 },
      },
      // Overdue, inter-state
      {
        customer: 'kabir.rao@gmail.com',
        daysAgo: 10,
        termsDays: 7,
        items: [['KIT-003', 1]],
      },
      // Pending, not yet due (shows in the last-7-days chart)
      {
        customer: 'neha.joshi@gmail.com',
        daysAgo: 4,
        termsDays: 15,
        items: [
          ['KIT-002', 10],
          ['KIT-001', 1],
        ],
      },
      {
        customer: 'diya.patel@gmail.com',
        daysAgo: 2,
        termsDays: 7,
        items: [['KIT-004', 2]],
        paid: { mode: 'Card', afterDays: 0 },
      },
      // The Figma example: 2 kettles + 3 flasks = ₹7,080
      {
        customer: 'aarav.mehta@gmail.com',
        daysAgo: 0,
        termsDays: 7,
        items: [
          ['KIT-001', 2],
          ['KIT-002', 3],
        ],
      },
    ],
  },
  {
    // Second vendor in Kerala: proves ownership isolation and a customer shared across vendors.
    vendor: {
      firstName: 'Priya',
      lastName: 'Nair',
      email: 'priya@nairhomestore.in',
      businessName: 'Nair Home Store',
      businessType: 'Home & kitchen retail',
      gstin: '32AAKFN4321M1Z8',
      phoneNumber: '+91 94470 55555',
      address: 'MG Road, Ernakulam',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682016',
      upiId: 'nairhomestore@upi',
    },
    settings: {
      invoicePrefix: 'NHS-2026-',
      invoiceNote: 'Thank you for choosing Nair Home Store.',
    },
    products: [
      {
        name: 'Mixer Grinder 750 W',
        sku: 'NHS-MG-01',
        price: 3999,
        gstRate: 18,
        hsn: '85094010',
        category: 'Home Appliances',
        brand: 'Philips',
        description: 'Three-jar mixer grinder with overload protection.',
      },
      {
        name: 'Non-stick Tawa',
        sku: 'NHS-TW-02',
        price: 749,
        gstRate: 12,
        hsn: '73239420',
        category: 'Kitchen',
        brand: 'Prestige',
        description: '28 cm induction-base non-stick tawa.',
      },
    ],
    customers: [
      aarav,
      {
        name: 'Anjali Menon',
        email: 'anjali.menon@gmail.com',
        phone: '+91 94470 22211',
        address: 'Panampilly Nagar',
        city: 'Kochi',
        state: 'Kerala',
        pincode: '682036',
      },
    ],
    invoices: [
      {
        customer: 'anjali.menon@gmail.com',
        daysAgo: 6,
        termsDays: 10,
        items: [['NHS-TW-02', 2]],
        paid: { mode: 'UPI', afterDays: 0 },
      },
      // Aarav (Gujarat) buys from a Kerala vendor: IGST, and appears in his multi-vendor bills
      {
        customer: 'aarav.mehta@gmail.com',
        daysAgo: 3,
        termsDays: 10,
        items: [['NHS-MG-01', 1]],
      },
    ],
  },
];

const upsertNames = async (kind: 'category' | 'brand', names: string[]) => {
  const ids = new Map<string, string>();
  for (const name of names) {
    const record =
      kind === 'category'
        ? await prisma.category.upsert({
            where: { name },
            create: { name },
            update: { active: true },
          })
        : await prisma.brand.upsert({
            where: { name },
            create: { name },
            update: { active: true },
          });
    ids.set(name, record.id);
  }
  return ids;
};

const resetDemoRecords = async () => {
  const vendorEmails = DEMO_VENDORS.map(entry => entry.vendor.email);
  const customerEmails = [
    ...new Set(DEMO_VENDORS.flatMap(entry => entry.customers.map(c => c.email))),
  ];
  await prisma.vendor.deleteMany({ where: { email: { in: vendorEmails } } });
  await prisma.customer.deleteMany({ where: { email: { in: customerEmails } } });
  await prisma.otpVerification.deleteMany({
    where: { email: { in: [...vendorEmails, ...customerEmails] } },
  });
};

const seedVendor = async (
  entry: DemoVendor,
  categoryIds: Map<string, string>,
  brandIds: Map<string, string>,
) => {
  const vendor = await prisma.vendor.create({
    data: {
      ...entry.vendor,
      isRegisteredGST: true,
      settings: { create: { ...entry.settings, nextInvoiceNumber: 1 } },
    },
  });

  const productIds = new Map<string, string>();
  for (const product of entry.products) {
    const { category, brand, active = true, ...fields } = product;
    const created = await prisma.product.create({
      data: {
        ...fields,
        active,
        unit: 'Pcs',
        unlimitedStock: true,
        vendorId: vendor.id,
        categoryId: categoryIds.get(category),
        brandId: brandIds.get(brand),
      },
    });
    productIds.set(product.sku, created.id);
  }

  const customerIds = new Map<string, string>();
  for (const customer of entry.customers) {
    const created = await customerService.createForVendor(vendor.id, customer);
    customerIds.set(customer.email, created.id);
  }

  const today = todayDateOnly();
  for (const invoice of entry.invoices) {
    const invoiceDate = addDays(today, -invoice.daysAgo);
    const created = await invoiceService.create(vendor.id, {
      customerId: customerIds.get(invoice.customer)!,
      items: invoice.items.map(([sku, quantity]) => ({
        productId: productIds.get(sku)!,
        quantity,
      })),
      invoiceDate: formatDateOnly(invoiceDate),
      dueDate: formatDateOnly(addDays(invoiceDate, invoice.termsDays)),
      discount: invoice.discount ?? 0,
    });
    if (invoice.paid) {
      await prisma.invoice.update({
        where: { id: created.id },
        data: {
          status: 'PAID',
          paymentMode: invoice.paid.mode,
          paidAt: addDays(invoiceDate, invoice.paid.afterDays),
          viewedAt: invoiceDate,
        },
      });
    }
  }

  return vendor;
};

const main = async () => {
  if (env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed demo data in production');
  }

  await prisma.admin.upsert({
    where: { email: DEMO_ADMIN.email },
    create: {
      name: DEMO_ADMIN.name,
      email: DEMO_ADMIN.email,
      password: await bcrypt.hash(DEMO_ADMIN.password, BCRYPT_SALT_ROUNDS),
    },
    update: { password: await bcrypt.hash(DEMO_ADMIN.password, BCRYPT_SALT_ROUNDS), active: true },
  });

  const categoryIds = await upsertNames('category', CATEGORIES);
  const brandIds = await upsertNames('brand', BRANDS);

  await resetDemoRecords();
  for (const entry of DEMO_VENDORS) {
    await seedVendor(entry, categoryIds, brandIds);
  }

  const otp = env.DEMO_OTP_CODE ?? '(set DEMO_OTP_CODE in .env, or read it from the server log)';
  console.info('\nDemo data ready.');
  console.info(`  Super Admin (password):  ${DEMO_ADMIN.email} / ${DEMO_ADMIN.password}`);
  console.info(`  Vendor (email OTP):      ${DEMO_VENDORS[0].vendor.email}  or  98250 12345`);
  console.info(`  Second vendor:           ${DEMO_VENDORS[1].vendor.email}`);
  console.info(`  Customer (email OTP):    ${aarav.email}  or  98765 43210`);
  console.info(`  OTP code:                ${otp}\n`);
};

main()
  .catch(error => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prismaService.disconnect());
