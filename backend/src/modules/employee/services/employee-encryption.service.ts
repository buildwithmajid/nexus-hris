import { Injectable } from '@nestjs/common';
import { Employee } from '@prisma/client';
import { EncryptionService } from '../../../common/crypto/encryption.service';

type EmployeeWithDecrypted = Employee & {
  nik?: string;
  bankAccountNumber?: string;
  npwp?: string;
};

@Injectable()
export class EmployeeEncryptionService {
  constructor(private readonly encryption: EncryptionService) {}

  encryptSensitiveFields(
    nik?: string,
    bankAccount?: string,
    npwp?: string,
  ): {
    encryptedNik: string | null;
    nikHash: string | null;
    encryptedBankAccount: string | null;
    encryptedNpwp: string | null;
    npwpHash: string | null;
  } {
    return {
      encryptedNik: nik ? this.encryption.encrypt(nik) : null,
      nikHash: nik ? this.encryption.hash(nik) : null,
      encryptedBankAccount: bankAccount ? this.encryption.encrypt(bankAccount) : null,
      encryptedNpwp: npwp ? this.encryption.encrypt(npwp) : null,
      npwpHash: npwp ? this.encryption.hash(npwp) : null,
    };
  }

  decryptSensitiveFields(employee: Employee): EmployeeWithDecrypted {
    const result: EmployeeWithDecrypted = { ...employee };

    delete (result as any).encryptedNik;
    delete (result as any).encryptedBankAccount;
    delete (result as any).encryptedNpwp;
    delete (result as any).nikHash;
    delete (result as any).npwpHash;

    if (employee.encryptedNik) {
      result.nik = this.encryption.decrypt(employee.encryptedNik);
    }
    if (employee.encryptedBankAccount) {
      result.bankAccountNumber = this.encryption.decrypt(employee.encryptedBankAccount);
    }
    if (employee.encryptedNpwp) {
      result.npwp = this.encryption.decrypt(employee.encryptedNpwp);
    }

    return result;
  }

  hashForSearch(value: string): string {
    return this.encryption.hash(value);
  }
}
