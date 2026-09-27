import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * @RequirePermissions(...permissions) — deklarasikan permission yang dibutuhkan.
 *
 * Contoh penggunaan:
 * @RequirePermissions('employee.create')
 * @RequirePermissions('payroll.read', 'payroll.approve') // AND logic
 *
 * Permission code menggunakan format "resource.action":
 * employee.read, employee.create, employee.update, employee.delete
 * payroll.read, payroll.run, payroll.approve, payroll.lock
 * attendance.read, attendance.correct
 * leave.read, leave.approve
 * report.read
 * config.manage (super admin)
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

