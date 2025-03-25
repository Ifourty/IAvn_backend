import { Module } from '@nestjs/common';
import { CGPTController } from 'src/controllers/cgpt.controller';
import { ConfigModule } from '@nestjs/config';
import { CgptToolsService } from 'src/services/cgptTools.service';
import { CgptWorldBuildingService } from 'src/services/cgptWorldBuilding.service';

@Module({
    imports: [ConfigModule.forRoot({
        isGlobal: true,
    })],
    controllers: [CGPTController],
    providers: [CgptToolsService, CgptWorldBuildingService],
})
export class CgptModule { }
