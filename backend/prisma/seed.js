"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2 = require("argon2");
const prisma = new client_1.PrismaClient();
const PERMISSIONS = [
    { code: 'employee.read', description: 'Lihat data karyawan' },
    { code: 'employee.create', description: 'Tambah karyawan baru' },
    { code: 'employee.update', description: 'Edit data karyawan' },
    { code: 'employee.delete', description: 'Nonaktifkan karyawan' },
    { code: 'attendance.read', description: 'Lihat data absensi' },
    { code: 'attendance.correct', description: 'Koreksi absensi karyawan' },
    { code: 'attendance.self', description: 'Clock-in/out sendiri' },
    { code: 'leave.read', description: 'Lihat data cuti' },
    { code: 'leave.request', description: 'Ajukan cuti' },
    { code: 'leave.approve', description: 'Approve/reject pengajuan cuti' },
    { code: 'payroll.read', description: 'Lihat data payroll' },
    { code: 'payroll.run', description: 'Jalankan proses payroll' },
    { code: 'payroll.approve', description: 'Approve batch payroll' },
    { code: 'payroll.lock', description: 'Lock periode payroll' },
    { code: 'report.read', description: 'Lihat laporan HR dan keuangan' },
    { code: 'config.manage', description: 'Kelola konfigurasi sistem (roles, rate pajak, dll)' },
];
const ROLE_PERMISSIONS = {
    super_admin: PERMISSIONS.map((p) => p.code),
    hr_admin: [
        'employee.read', 'employee.create', 'employee.update', 'employee.delete',
        'attendance.read', 'attendance.correct',
        'leave.read', 'leave.approve',
        'payroll.read', 'payroll.run',
        'report.read',
    ],
    finance: [
        'employee.read',
        'payroll.read', 'payroll.approve', 'payroll.lock',
        'report.read',
    ],
    manager: [
        'employee.read',
        'attendance.read',
        'leave.read', 'leave.approve',
        'payroll.read',
        'report.read',
    ],
    staff: [
        'attendance.self',
        'leave.request',
        'payroll.read',
    ],
};
async function main() {
    console.log('🌱 Memulai seed database Nexus HRIS...');
    console.log('  → Membuat permissions...');
    const permissionRecords = await Promise.all(PERMISSIONS.map((p) => prisma.permission.upsert({
        where: { code: p.code },
        update: {},
        create: p,
    })));
    console.log(`  ✓ ${permissionRecords.length} permissions dibuat`);
    console.log('  → Membuat roles dan mapping permissions...');
    const roleNames = Object.keys(ROLE_PERMISSIONS);
    for (const roleName of roleNames) {
        const role = await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: {
                name: roleName,
                description: getRoleDescription(roleName),
            },
        });
        const permCodes = ROLE_PERMISSIONS[roleName];
        const perms = permissionRecords.filter((p) => permCodes.includes(p.code));
        await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
        await prisma.rolePermission.createMany({
            data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
        });
        console.log(`  ✓ Role '${roleName}' → ${perms.length} permissions`);
    }
    console.log('  → Membuat super admin user...');
    const superAdminRole = await prisma.role.findUnique({
        where: { name: 'super_admin' },
    });
    if (!superAdminRole)
        throw new Error('Role super_admin tidak ditemukan');
    const DEFAULT_SUPER_ADMIN_PASSWORD = 'NexusAdmin@2026!';
    const passwordHash = await argon2.hash(DEFAULT_SUPER_ADMIN_PASSWORD, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
    });
    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@nexus-hris.id' },
        update: {},
        create: {
            email: 'admin@nexus-hris.id',
            passwordHash,
            roleId: superAdminRole.id,
        },
    });
    console.log(`  ✓ Super admin: ${superAdmin.email}`);
    console.log('  ⚠️  PENTING: Ganti password super admin segera setelah login pertama!');
    console.log('  → Membuat default company...');
    await prisma.company.upsert({
        where: { id: 'a0000000-0000-4000-8000-000000000001' },
        update: {},
        create: {
            id: 'a0000000-0000-4000-8000-000000000001',
            name: 'PT Nusantara Digital Solusi',
            riskClassJkk: 'I',
            address: 'Jl. Jend. Sudirman No. 1, Jakarta Selatan 12190',
        },
    });
    console.log('  ✓ Default company dibuat');
    console.log('\n✅ Seed selesai!');
    console.log(`\nLogin dengan:`);
    console.log(`  Email   : admin@nexus-hris.id`);
    console.log(`  Password: ${DEFAULT_SUPER_ADMIN_PASSWORD}`);
    console.log(`\n  ⚠️  Segera ganti password ini!\n`);
}
function getRoleDescription(roleName) {
    const descriptions = {
        super_admin: 'Super Admin — akses penuh ke semua fitur dan konfigurasi sistem',
        hr_admin: 'HR Administrator — kelola data karyawan, absensi, cuti, dan payroll',
        finance: 'Finance — approve dan lock payroll, lihat laporan keuangan',
        manager: 'Manager / Atasan — approve cuti dan lembur tim, lihat laporan tim',
        staff: 'Karyawan / Staff — absensi, ajukan cuti, lihat slip gaji sendiri',
    };
    return descriptions[roleName] ?? roleName;
}
main()
    .catch((e) => {
    console.error('Seed gagal:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map