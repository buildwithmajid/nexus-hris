import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Mengambil pengaturan profil perusahaan
   */
  @Get('company/:id')
  @RequirePermissions('config.manage')
  getCompanySettings(@Param('id', ParseUUIDPipe) id: string) {
    return this.settingsService.getCompanySettings(id);
  }

  /**
   * Memperbarui pengaturan legalitas perusahaan
   */
  @Patch('company/:id')
  @RequirePermissions('config.manage')
  updateCompanySettings(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanySettingsDto,
  ) {
    return this.settingsService.updateCompanySettings(id, dto);
  }

  /**
   * Mengambil referensi parameter statuter (BPJS & PPh 21 TER)
   */
  @Get('statutory-rates')
  @RequirePermissions('config.manage')
  getStatutoryRates() {
    return this.settingsService.getStatutoryRates();
  }

  /**
   * Mengambil daftar pengguna terdaftar
   */
  @Get('users')
  @RequirePermissions('config.manage')
  getUsers() {
    return this.settingsService.getUsers();
  }

  /**
   * Mengambil daftar peran (roles) dan permissions
   */
  @Get('roles')
  @RequirePermissions('config.manage')
  getRoles() {
    return this.settingsService.getRoles();
  }

  /**
   * Mengubah peran (role) pengguna
   */
  @Patch('users/:id/role')
  @RequirePermissions('config.manage')
  updateUserRole(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body('roleId', ParseUUIDPipe) roleId: string,
  ) {
    return this.settingsService.updateUserRole(userId, roleId);
  }
}

