import { Controller, Get } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private configService: ConfigService) { }

  @Get()
  getHello(): string {
    return this.configService.get('MONENV') ?? 'Not found';
  }
}
