import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { ConfigModule } from '@nestjs/config';
import { CgptModule } from './cgpt.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), CgptModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
