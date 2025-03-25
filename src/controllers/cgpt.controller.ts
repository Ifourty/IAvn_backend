import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WorldBuildingOutput } from 'src/dto/DtoCgpt';
import { CgptWorldBuildingService } from 'src/services/cgptWorldBuilding.service';

@Controller()
export class CGPTController {
    constructor(private readonly cgptWorldBuildingService: CgptWorldBuildingService, private configService: ConfigService) { }

    @Post('cgptWorldBuilding')
    async cgptWorldBuilding(
        @Body() body: { prompt: string; threadId: string; runId: string, phase: number }
    ): Promise<WorldBuildingOutput | null> {
        const { prompt, threadId, runId, phase } = body;
        if (!prompt && !threadId && !runId) {
            throw new BadRequestException('Prompt is required');
        }
        if (runId && !threadId) {
            throw new BadRequestException('The threadId is required when runId is provided');
        }
        if (phase === undefined) {
            throw new BadRequestException('Phase is required');
        } else if (phase < 0 && phase > 2) {
            throw new BadRequestException('Phase must be between 0 and 2');
        }
        if (threadId) {
            if (runId) {
                return await this.cgptWorldBuildingService.checkStatus(threadId, runId, phase);
            } else {
                return await this.cgptWorldBuildingService.continueThread(threadId, prompt, phase);
            }
        } else {
            return await this.cgptWorldBuildingService.startNewThread(prompt, phase);
        }
    }
}
