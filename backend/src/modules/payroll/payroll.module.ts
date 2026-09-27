import { Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { PayrollPeriodWorkflowService } from './services/payroll-period-workflow.service';
import { PayrollCalculationService } from './services/payroll-calculation.service';
import { PayrollRateLoaderService } from './helpers/payroll-rate-loader.service';

@Module({
  controllers: [PayrollController],
  providers: [PayrollService, PayrollPeriodWorkflowService, PayrollCalculationService, PayrollRateLoaderService],
  exports: [PayrollService, PayrollPeriodWorkflowService, PayrollCalculationService, PayrollRateLoaderService],
})
export class PayrollModule {}

