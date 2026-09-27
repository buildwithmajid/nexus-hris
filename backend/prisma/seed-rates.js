"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const prisma = new client_1.PrismaClient();
async function seedRates() {
    console.log('📊 Memulai seeding tarif pajak & BPJS resmi ke database...');
    const rulesDir = path.resolve(__dirname, '../../payroll-engine/src/rules');
    const berlakuSejak = new Date('2024-01-01');
    const ptkpData = JSON.parse(fs.readFileSync(path.join(rulesDir, 'ptkp.rates.json'), 'utf-8'));
    await prisma.ptkpRate.deleteMany({});
    for (const item of ptkpData) {
        await prisma.ptkpRate.create({
            data: {
                status: item.status,
                amountPerYear: item.amountPerYear,
                berlakuSejak,
            },
        });
    }
    console.log(`  ✓ ${ptkpData.length} tarif PTKP berhasil disimpan`);
    const terData = JSON.parse(fs.readFileSync(path.join(rulesDir, 'pph21-ter.rates.json'), 'utf-8'));
    await prisma.terRate.deleteMany({});
    for (const item of terData) {
        await prisma.terRate.create({
            data: {
                kategori: item.kategori,
                batasBawah: BigInt(item.batasBawah),
                batasAtas: item.batasAtas !== null ? BigInt(item.batasAtas) : null,
                tarif: item.tarif,
                berlakuSejak,
            },
        });
    }
    console.log(`  ✓ ${terData.length} baris tarif TER (A/B/C) berhasil disimpan`);
    const bpjsData = JSON.parse(fs.readFileSync(path.join(rulesDir, 'bpjs.rates.json'), 'utf-8'));
    await prisma.bpjsRate.deleteMany({});
    await prisma.bpjsRate.createMany({
        data: [
            {
                program: 'kesehatan',
                companyPercentage: bpjsData.kesehatan.companyPercent,
                employeePercentage: bpjsData.kesehatan.employeePercent,
                wageCap: BigInt(bpjsData.kesehatan.wageCap),
                berlakuSejak,
            },
            {
                program: 'jht',
                companyPercentage: bpjsData.ketenagakerjaan.jht.companyPercent,
                employeePercentage: bpjsData.ketenagakerjaan.jht.employeePercent,
                wageCap: null,
                berlakuSejak,
            },
            {
                program: 'jkk',
                companyPercentage: bpjsData.ketenagakerjaan.jkk.companyPercent,
                employeePercentage: 0,
                riskClass: 'I',
                wageCap: null,
                berlakuSejak,
            },
            {
                program: 'jkm',
                companyPercentage: bpjsData.ketenagakerjaan.jkm.companyPercent,
                employeePercentage: 0,
                wageCap: null,
                berlakuSejak,
            },
            {
                program: 'jp',
                companyPercentage: bpjsData.ketenagakerjaan.jp.companyPercent,
                employeePercentage: bpjsData.ketenagakerjaan.jp.employeePercent,
                wageCap: BigInt(bpjsData.ketenagakerjaan.jp.wageCap),
                berlakuSejak,
            },
        ],
    });
    console.log(`  ✓ 5 program BPJS berhasil disimpan`);
    const defaultCompanyId = 'a0000000-0000-4000-8000-000000000001';
    const company = await prisma.company.findUnique({ where: { id: defaultCompanyId } });
    if (company) {
        await prisma.overtimeRule.deleteMany({ where: { companyId: defaultCompanyId } });
        await prisma.overtimeRule.createMany({
            data: [
                { companyId: defaultCompanyId, isHoliday: false, hourFrom: 0, hourTo: 1, multiplier: 1.5 },
                { companyId: defaultCompanyId, isHoliday: false, hourFrom: 1, hourTo: null, multiplier: 2.0 },
                { companyId: defaultCompanyId, isHoliday: true, hourFrom: 0, hourTo: 8, multiplier: 2.0 },
                { companyId: defaultCompanyId, isHoliday: true, hourFrom: 8, hourTo: 9, multiplier: 3.0 },
                { companyId: defaultCompanyId, isHoliday: true, hourFrom: 9, hourTo: null, multiplier: 4.0 },
            ],
        });
        console.log(`  ✓ Aturan lembur Kepmenaker 102/2004 berhasil disimpan untuk company default`);
    }
    console.log('✅ Seeding tarif selesai!\n');
}
seedRates()
    .catch((e) => {
    console.error('Gagal seeding tarif:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-rates.js.map