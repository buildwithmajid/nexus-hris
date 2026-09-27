import { Injectable } from '@nestjs/common';
import { EmploymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmployeeHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async recordSalaryChange(
    employeeId: string,
    oldValue: number,
    newValue: number,
    changedById: string,
  ): Promise<void> {
    if (oldValue !== newValue) {
      await this.prisma.employeeHistory.create({
        data: {
          employeeId,
          fieldChanged: 'baseSalary',
          oldValue: String(oldValue),
          newValue: String(newValue),
          effectiveDate: new Date(),
          changedById,
        },
      });
    }
  }

  async recordPositionChange(
    employeeId: string,
    oldPositionId: string,
    newPositionId: string,
    changedById: string,
  ): Promise<void> {
    if (oldPositionId !== newPositionId) {
      await this.prisma.employeeHistory.create({
        data: {
          employeeId,
          fieldChanged: 'positionId',
          oldValue: oldPositionId,
          newValue: newPositionId,
          effectiveDate: new Date(),
          changedById,
        },
      });
    }
  }

  async recordDepartmentChange(
    employeeId: string,
    oldDeptId: string,
    newDeptId: string,
    changedById: string,
  ): Promise<void> {
    if (oldDeptId !== newDeptId) {
      await this.prisma.employeeHistory.create({
        data: {
          employeeId,
          fieldChanged: 'departmentId',
          oldValue: oldDeptId,
          newValue: newDeptId,
          effectiveDate: new Date(),
          changedById,
        },
      });
    }
  }

  async recordStatusChange(
    employeeId: string,
    oldStatus: EmploymentStatus,
    newStatus: EmploymentStatus,
    changedById: string,
  ): Promise<void> {
    if (oldStatus !== newStatus) {
      await this.prisma.employeeHistory.create({
        data: {
          employeeId,
          fieldChanged: 'employmentStatus',
          oldValue: oldStatus,
          newValue: newStatus,
          effectiveDate: new Date(),
          changedById,
        },
      });
    }
  }

  async recordMultipleChanges(
    employeeId: string,
    changes: Array<{ field: string; oldValue?: string | null; newValue?: string | null }>,
    changedById: string,
  ): Promise<void> {
    if (changes.length === 0) return;

    await this.prisma.employeeHistory.createMany({
      data: changes.map((change) => ({
        employeeId,
        fieldChanged: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        effectiveDate: new Date(),
        changedById,
      })),
    });
  }
}
