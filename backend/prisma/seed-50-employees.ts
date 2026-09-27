import { PrismaClient, ContractType, EmploymentStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { createCipheriv, randomBytes, createHash } from 'crypto';

const prisma = new PrismaClient();

// Setup crypto helper matching EncryptionService
const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY || 'a6fe29d0d876deec36c1e0b8db55bd27d5ec5433e1ebb36cc27e656a3fe0b09c',
  'hex',
);
const ENCRYPTION_PEPPER = process.env.ENCRYPTION_PEPPER || '595492230b3cf948effb6a576c9bcd91';

function encrypt(text: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('base64'), encrypted.toString('base64'), authTag.toString('base64')].join(':');
}

function hashPepper(val: string): string {
  return createHash('sha256').update(val + ENCRYPTION_PEPPER).digest('hex');
}

const DEPARTMENTS_DATA = [
  {
    name: 'Teknologi & Rekayasa Perangkat Lunak',
    positions: [
      { title: 'VP of Engineering', level: 5 },
      { title: 'Lead Fullstack Architect', level: 4 },
      { title: 'Senior Backend Engineer', level: 3 },
      { title: 'Senior Frontend Engineer', level: 3 },
      { title: 'DevOps & Security Engineer', level: 3 },
      { title: 'QA Automation Engineer', level: 2 },
      { title: 'Software Engineer', level: 2 },
      { title: 'Junior Backend Engineer', level: 1 },
      { title: 'Junior Frontend Engineer', level: 1 },
    ],
  },
  {
    name: 'Sumber Daya Manusia & Operasional',
    positions: [
      { title: 'Head of People Operations', level: 5 },
      { title: 'HR Business Partner', level: 3 },
      { title: 'Payroll & Compensation Specialist', level: 3 },
      { title: 'Talent Acquisition Specialist', level: 2 },
      { title: 'Recruiter & Employer Branding', level: 2 },
      { title: 'General Affairs Officer', level: 1 },
      { title: 'HR Administration Officer', level: 1 },
    ],
  },
  {
    name: 'Keuangan, Akuntansi & Perpajakan',
    positions: [
      { title: 'Finance & Tax Director', level: 5 },
      { title: 'Senior Tax Accountant', level: 3 },
      { title: 'Financial Analyst', level: 3 },
      { title: 'Internal Auditor', level: 3 },
      { title: 'Accounts Payable Specialist', level: 2 },
      { title: 'Junior Accountant', level: 1 },
      { title: 'Finance Staff', level: 1 },
    ],
  },
  {
    name: 'Pemasaran & Penjualan Komersial',
    positions: [
      { title: 'Chief Commercial Officer', level: 5 },
      { title: 'Enterprise Account Executive', level: 3 },
      { title: 'Digital Marketing Lead', level: 3 },
      { title: 'Brand & Content Specialist', level: 2 },
      { title: 'Sales Development Rep', level: 1 },
      { title: 'Marketing Associate', level: 1 },
      { title: 'Content Creator & Media', level: 1 },
    ],
  },
  {
    name: 'Operasional & Rantai Pasok',
    positions: [
      { title: 'Head of Operations', level: 4 },
      { title: 'Customer Success Lead', level: 3 },
      { title: 'Logistics Coordinator', level: 2 },
      { title: 'Facility Supervisor', level: 2 },
      { title: 'Customer Support Specialist', level: 1 },
      { title: 'Warehouse Coordinator', level: 1 },
      { title: 'Field Operations Specialist', level: 1 },
    ],
  },
  {
    name: 'Produk, Desain & Riset Bisnis',
    positions: [
      { title: 'Head of Product', level: 5 },
      { title: 'Senior Product Manager', level: 4 },
      { title: 'Senior Product Designer', level: 3 },
      { title: 'User Researcher', level: 2 },
      { title: 'Technical Writer', level: 2 },
      { title: 'Product Analyst', level: 2 },
      { title: 'Junior UI Designer', level: 1 },
      { title: 'UX Copywriter', level: 1 },
    ],
  },
];

// 50 Profil Karyawan Lengkap Realistis Indonesia
const EMPLOYEES_SEEDS = [
  // 1-10: C-Level & Leads (High Earner, TER B & TER C, Wage Cap trigger)
  { name: 'Hendra Wijaya', dept: 'Teknologi & Rekayasa Perangkat Lunak', pos: 'VP of Engineering', ptkp: 'K/2', salary: 34000000, allowance: 4000000, bank: 'BCA', gender: 'M' },
  { name: 'Siti Rahmawati', dept: 'Sumber Daya Manusia & Operasional', pos: 'Head of People Operations', ptkp: 'K/1', salary: 28000000, allowance: 3500000, bank: 'Bank Mandiri', gender: 'F' },
  { name: 'Bambang Pratama', dept: 'Keuangan, Akuntansi & Perpajakan', pos: 'Finance & Tax Director', ptkp: 'K/3', salary: 32000000, allowance: 3500000, bank: 'BCA', gender: 'M' },
  { name: 'Dian Sastrodimedjo', dept: 'Pemasaran & Penjualan Komersial', pos: 'Chief Commercial Officer', ptkp: 'TK/1', salary: 30000000, allowance: 3000000, bank: 'BNI', gender: 'F' },
  { name: 'Rizky Ramadhan', dept: 'Produk, Desain & Riset Bisnis', pos: 'Head of Product', ptkp: 'K/1', salary: 29000000, allowance: 3000000, bank: 'BCA', gender: 'M' },
  { name: 'Agus Setiawan', dept: 'Teknologi & Rekayasa Perangkat Lunak', pos: 'Lead Fullstack Architect', ptkp: 'K/2', salary: 24000000, allowance: 2500000, bank: 'BCA', gender: 'M' },
  { name: 'Nurul Hidayati', dept: 'Sumber Daya Manusia & Operasional', pos: 'HR Business Partner', ptkp: 'TK/0', salary: 17500000, allowance: 1500000, bank: 'BRI', gender: 'F' },
  { name: 'Maya Indriani', dept: 'Keuangan, Akuntansi & Perpajakan', pos: 'Senior Tax Accountant', ptkp: 'TK/1', salary: 18000000, allowance: 1500000, bank: 'Bank Mandiri', gender: 'F' },
  { name: 'Kevin Tanuwidjaja', dept: 'Pemasaran & Penjualan Komersial', pos: 'Enterprise Account Executive', ptkp: 'K/0', salary: 19000000, allowance: 2000000, bank: 'BCA', gender: 'M' },
  { name: 'Farhan Maulana', dept: 'Teknologi & Rekayasa Perangkat Lunak', pos: 'Senior Backend Engineer', ptkp: 'TK/0', salary: 16500000, allowance: 1500000, bank: 'BCA', gender: 'M' },

  // 11-20: Senior & Specialist (Mid-High Earner, TER A, B, C)
  { name: 'Tri Wahyuni', dept: 'Produk, Desain & Riset Bisnis', pos: 'Senior Product Manager', ptkp: 'K/2', salary: 22000000, allowance: 2000000, bank: 'Bank Mandiri', gender: 'F' },
  { name: 'Aditya Nugraha', dept: 'Teknologi & Rekayasa Perangkat Lunak', pos: 'DevOps & Security Engineer', ptkp: 'TK/0', salary: 15500000, allowance: 1200000, bank: 'BNI', gender: 'M' },
  { name: 'Rina Marlina', dept: 'Sumber Daya Manusia & Operasional', pos: 'Talent Acquisition Specialist', ptkp: 'TK/1', salary: 12000000, allowance: 1000000, bank: 'BCA', gender: 'F' },
  { name: 'Eko Prasetyo', dept: 'Keuangan, Akuntansi & Perpajakan', pos: 'Financial Analyst', ptkp: 'K/1', salary: 13500000, allowance: 1200000, bank: 'Bank Mandiri', gender: 'M' },
  { name: 'Cindy Claudia', dept: 'Pemasaran & Penjualan Komersial', pos: 'Digital Marketing Lead', ptkp: 'TK/0', salary: 14000000, allowance: 1200000, bank: 'BCA', gender: 'F' },
  { name: 'Dimas Aryasuta', dept: 'Operasional & Rantai Pasok', pos: 'Head of Operations', ptkp: 'K/3', salary: 21000000, allowance: 2000000, bank: 'BCA', gender: 'M' },
  { name: 'Putri Ayu Lestari', dept: 'Produk, Desain & Riset Bisnis', pos: 'Senior Product Designer', ptkp: 'TK/0', salary: 15000000, allowance: 1500000, bank: 'BCA', gender: 'F' },
  { name: 'Arief Budiman', dept: 'Teknologi & Rekayasa Perangkat Lunak', pos: 'Senior Frontend Engineer', ptkp: 'K/0', salary: 16000000, allowance: 1500000, bank: 'BNI', gender: 'M' },
  { name: 'Dewi Lestari', dept: 'Sumber Daya Manusia & Operasional', pos: 'Payroll & Compensation Specialist', ptkp: 'K/1', salary: 14500000, allowance: 1200000, bank: 'BCA', gender: 'F' },
  { name: 'Fajar Siddiq', dept: 'Keuangan, Akuntansi & Perpajakan', pos: 'Internal Auditor', ptkp: 'TK/2', salary: 14000000, allowance: 1000000, bank: 'Bank Mandiri', gender: 'M' },

  // 21-30: Mid-Level Officers & Engineers
  { name: 'Nadia Safitri', dept: 'Pemasaran & Penjualan Komersial', pos: 'Brand & Content Specialist', ptkp: 'TK/0', salary: 10500000, allowance: 800000, bank: 'BCA', gender: 'F' },
  { name: 'Wahyu Hidayat', dept: 'Operasional & Rantai Pasok', pos: 'Logistics Coordinator', ptkp: 'K/2', salary: 9800000, allowance: 700000, bank: 'BRI', gender: 'M' },
  { name: 'Rahmat Hidayat', dept: 'Operasional & Rantai Pasok', pos: 'Customer Success Lead', ptkp: 'K/1', salary: 13000000, allowance: 1000000, bank: 'BCA', gender: 'M' },
  { name: 'Jessica Amanda', dept: 'Produk, Desain & Riset Bisnis', pos: 'User Researcher', ptkp: 'TK/0', salary: 11500000, allowance: 900000, bank: 'BCA', gender: 'F' },
  { name: 'Bayu Permana', dept: 'Teknologi & Rekayasa Perangkat Lunak', pos: 'QA Automation Engineer', ptkp: 'TK/1', salary: 11000000, allowance: 800000, bank: 'BNI', gender: 'M' },
  { name: 'Anisa Rahma', dept: 'Sumber Daya Manusia & Operasional', pos: 'Recruiter & Employer Branding', ptkp: 'TK/0', salary: 9000000, allowance: 600000, bank: 'BCA', gender: 'F' },
  { name: 'Yoga Pratama', dept: 'Keuangan, Akuntansi & Perpajakan', pos: 'Accounts Payable Specialist', ptkp: 'K/0', salary: 9500000, allowance: 700000, bank: 'Bank Mandiri', gender: 'M' },
  { name: 'Gilang Ramadhan', dept: 'Pemasaran & Penjualan Komersial', pos: 'Sales Development Rep', ptkp: 'TK/0', salary: 8500000, allowance: 600000, bank: 'BCA', gender: 'M' },
  { name: 'Dwi Handayani', dept: 'Operasional & Rantai Pasok', pos: 'Customer Support Specialist', ptkp: 'K/1', salary: 8200000, allowance: 600000, bank: 'BRI', gender: 'F' },
  { name: 'Faisal Akbar', dept: 'Operasional & Rantai Pasok', pos: 'Facility Supervisor', ptkp: 'K/2', salary: 9000000, allowance: 800000, bank: 'BNI', gender: 'M' },

  // 31-40: Associates & Staff
  { name: 'Surya Saputra', dept: 'Produk, Desain & Riset Bisnis', pos: 'Technical Writer', ptkp: 'TK/0', salary: 8800000, allowance: 600000, bank: 'BCA', gender: 'M' },
  { name: 'Intan Permatasari', dept: 'Teknologi & Rekayasa Perangkat Lunak', pos: 'Software Engineer', ptkp: 'TK/0', salary: 9500000, allowance: 700000, bank: 'BCA', gender: 'F' },
  { name: 'Ilham Kurniawan', dept: 'Teknologi & Rekayasa Perangkat Lunak', pos: 'Junior Frontend Engineer', ptkp: 'TK/0', salary: 7500000, allowance: 500000, bank: 'Bank Mandiri', gender: 'M' },
  { name: 'Sarah Melati', dept: 'Sumber Daya Manusia & Operasional', pos: 'HR Administration Officer', ptkp: 'TK/1', salary: 7800000, allowance: 500000, bank: 'BCA', gender: 'F' },
  { name: 'Danang Priyambodo', dept: 'Keuangan, Akuntansi & Perpajakan', pos: 'Junior Accountant', ptkp: 'K/0', salary: 7500000, allowance: 500000, bank: 'BCA', gender: 'M' },
  { name: 'Wulan Guritno', dept: 'Pemasaran & Penjualan Komersial', pos: 'Marketing Associate', ptkp: 'TK/0', salary: 7200000, allowance: 500000, bank: 'BNI', gender: 'F' },
  { name: 'Bagus Wicaksono', dept: 'Operasional & Rantai Pasok', pos: 'Warehouse Coordinator', ptkp: 'K/1', salary: 7000000, allowance: 600000, bank: 'BRI', gender: 'M' },
  { name: 'Mega Puspitasari', dept: 'Produk, Desain & Riset Bisnis', pos: 'Junior UI Designer', ptkp: 'TK/0', salary: 7800000, allowance: 500000, bank: 'BCA', gender: 'F' },
  { name: 'Taufik Ismail', dept: 'Teknologi & Rekayasa Perangkat Lunak', pos: 'Junior Backend Engineer', ptkp: 'TK/2', salary: 8000000, allowance: 500000, bank: 'Bank Mandiri', gender: 'M' },
  { name: 'Ratna Sari', dept: 'Sumber Daya Manusia & Operasional', pos: 'General Affairs Officer', ptkp: 'K/0', salary: 6800000, allowance: 500000, bank: 'BCA', gender: 'F' },

  // 41-50: Entry Staff / Operations (TER A & UMR Jakarta brackets)
  { name: 'Rio Febrian', dept: 'Keuangan, Akuntansi & Perpajakan', pos: 'Finance Staff', ptkp: 'TK/0', salary: 6500000, allowance: 500000, bank: 'BCA', gender: 'M' },
  { name: 'Bella Novita', dept: 'Pemasaran & Penjualan Komersial', pos: 'Content Creator & Media', ptkp: 'TK/0', salary: 6800000, allowance: 500000, bank: 'BCA', gender: 'F' },
  { name: 'Galih Prakoso', dept: 'Operasional & Rantai Pasok', pos: 'Field Operations Specialist', ptkp: 'K/2', salary: 6200000, allowance: 600000, bank: 'BRI', gender: 'M' },
  { name: 'Tiara Andini', dept: 'Produk, Desain & Riset Bisnis', pos: 'Product Analyst', ptkp: 'TK/0', salary: 8500000, allowance: 600000, bank: 'BNI', gender: 'F' },
  { name: 'Rendy Pandugo', dept: 'Teknologi & Rekayasa Perangkat Lunak', pos: 'Software Engineer', ptkp: 'K/1', salary: 10200000, allowance: 800000, bank: 'BCA', gender: 'M' },
  { name: 'Vina Panduwinata', dept: 'Sumber Daya Manusia & Operasional', pos: 'HR Administration Officer', ptkp: 'K/3', salary: 7200000, allowance: 500000, bank: 'Bank Mandiri', gender: 'F' },
  { name: 'Tommy Kurniawan', dept: 'Keuangan, Akuntansi & Perpajakan', pos: 'Junior Accountant', ptkp: 'TK/0', salary: 6500000, allowance: 500000, bank: 'BCA', gender: 'M' },
  { name: 'Gita Gutawa', dept: 'Pemasaran & Penjualan Komersial', pos: 'Marketing Associate', ptkp: 'TK/0', salary: 6900000, allowance: 500000, bank: 'BCA', gender: 'F' },
  { name: 'Doni Tata', dept: 'Operasional & Rantai Pasok', pos: 'Field Operations Specialist', ptkp: 'K/1', salary: 6400000, allowance: 600000, bank: 'BRI', gender: 'M' },
  { name: 'Annisa Pohan', dept: 'Produk, Desain & Riset Bisnis', pos: 'UX Copywriter', ptkp: 'K/0', salary: 7800000, allowance: 500000, bank: 'Bank Mandiri', gender: 'F' },
];

async function main() {
  console.log('🚀 Memulai Seeding 50 Karyawan Realistis Nexus HRIS...');

  const company = await prisma.company.findFirst();
  if (!company) throw new Error('Company default tidak ditemukan');

  const staffRole = await prisma.role.findUnique({ where: { name: 'staff' } });
  const managerRole = await prisma.role.findUnique({ where: { name: 'manager' } });
  if (!staffRole) throw new Error('Role staff tidak ditemukan');

  const passwordHash = await argon2.hash('NexusStaff@2026!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // 1. Sinkronisasi Departemen & Posisi
  console.log('📁 Membuat Departemen & Posisi Jabatan...');
  const deptMap = new Map<string, string>();
  const posMap = new Map<string, string>();

  for (const deptData of DEPARTMENTS_DATA) {
    let dept = await prisma.department.findFirst({
      where: { companyId: company.id, name: deptData.name },
    });

    if (!dept) {
      dept = await prisma.department.create({
        data: { companyId: company.id, name: deptData.name },
      });
    }
    deptMap.set(deptData.name, dept.id);

    for (const posData of deptData.positions) {
      let pos = await prisma.position.findFirst({
        where: { departmentId: dept.id, title: posData.title },
      });

      if (!pos) {
        pos = await prisma.position.create({
          data: {
            departmentId: dept.id,
            title: posData.title,
            level: posData.level,
          },
        });
      }
      posMap.set(`${deptData.name}::${posData.title}`, pos.id);
    }
  }
  console.log(`  ✓ ${deptMap.size} Departemen & ${posMap.size} Posisi siap.`);

  // 2. Seeding 50 Karyawan Lengkap
  console.log('👥 Menginput 50 Data Karyawan...');
  let createdCount = 0;

  for (let i = 0; i < EMPLOYEES_SEEDS.length; i++) {
    const seed = EMPLOYEES_SEEDS[i];
    const codeNum = String(i + 1).padStart(3, '0');
    const employeeCode = `NX-${codeNum}`;

    const cleanEmail = seed.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
    const email = `${cleanEmail}@nexus-hris.id`;

    // Buat / ambil user account
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const assignedRole = (seed.salary > 20000000 && managerRole) ? managerRole.id : staffRole.id;
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          roleId: assignedRole,
        },
      });
    }

    // Cek apakah karyawan sudah ada
    let emp = await prisma.employee.findUnique({ where: { employeeCode } });
    if (!emp) {
      const deptId = deptMap.get(seed.dept)!;
      const posId = posMap.get(`${seed.dept}::${seed.pos}`)!;

      // Generate dummy valid format data identitas
      const nikPlain = `317${seed.gender === 'M' ? '1' : '2'}0${(i % 9) + 1}28059${(i % 10)}000${(i % 9) + 1}`;
      const npwpPlain = `08.${String(100 + i).padStart(3, '0')}.452.1-01${(i % 9) + 1}.000`;
      const bankAccPlain = `5271${String(800000 + i * 137).padStart(6, '0')}`;
      const bpjsKesPlain = `000184920${String(100 + i)}`;
      const bpjsTkPlain = `22081940${String(100 + i)}`;

      emp = await prisma.employee.create({
        data: {
          userId: user.id,
          companyId: company.id,
          departmentId: deptId,
          positionId: posId,
          employeeCode,
          fullName: seed.name,
          birthDate: new Date('1994-06-15'),
          joinDate: new Date('2023-01-10'),
          contractType: ContractType.PERMANENT,
          employmentStatus: EmploymentStatus.ACTIVE,
          maritalStatusPtkp: seed.ptkp,
          baseSalary: seed.salary,
          fixedAllowance: seed.allowance,
          encryptedNik: encrypt(nikPlain),
          nikHash: hashPepper(nikPlain),
          encryptedNpwp: encrypt(npwpPlain),
          npwpHash: hashPepper(npwpPlain),
          encryptedBankAccount: encrypt(bankAccPlain),
          bankName: seed.bank,
          bpjsKesehatanNumber: bpjsKesPlain,
          bpjsTkNumber: bpjsTkPlain,
        },
      });

      // Tambahkan saldo cuti tahun 2026 (12 hari)
      const annualLeaveType = await prisma.leaveType.findFirst({
        where: { name: { contains: 'Tahunan' } },
      });
      if (annualLeaveType) {
        await prisma.leaveBalance.upsert({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: emp.id,
              leaveTypeId: annualLeaveType.id,
              year: 2026,
            },
          },
          update: {},
          create: {
            employeeId: emp.id,
            leaveTypeId: annualLeaveType.id,
            year: 2026,
            quotaDays: 12,
            usedDays: i % 4, // Beberapa sudah terpakai 0-3 hari
          },
        });
      }

      createdCount++;
    }
  }

  console.log(`✅ Sukses menambahkan ${createdCount} karyawan baru.`);
  const totalEmployees = await prisma.employee.count();
  console.log(`📊 Total Karyawan saat ini: ${totalEmployees} orang di seluruh perusahaan.`);
}

main()
  .catch((e) => {
    console.error('Seeding 50 karyawan gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
