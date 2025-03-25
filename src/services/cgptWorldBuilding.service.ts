/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CgptToolsService } from './cgptTools.service';
import { CgptWorldBuildingOutputFirstPhase, CgptWorldBuildingOutputSecondPhase, CgptWorldBuildingOutputThirdPhase, WorldBuildingOutput } from 'src/dto/DtoCgpt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CgptWorldBuildingService {
    private readonly jsonInstruction = "Repond uniquement à la demande en JSON aucun autre format n'est accepté";
    private readonly phasePrompts = [
        "Phase 1 de création, refert toi à ton fichier pour les détails (worldstory), prompt user : ",
        "Phase 2 de création, refert toi à ton fichier pour les détails (maincast), prompt user : ",
        "Phase 3 de création, refert toi à ton fichier pour les détails (details), prompt user : "
    ]

    constructor(private readonly cgptToolsService: CgptToolsService, private configService: ConfigService) { }

    async checkStatus(threadId: string, runId: string, phase: number): Promise<WorldBuildingOutput> {
        const status = await this.cgptToolsService.checkRunStatus(threadId, runId);
        if (!status) {
            throw new InternalServerErrorException('Error checking run status');
        }
        if (status === 'completed') {
            return await this.parseGptAnwser(threadId, runId, phase);
        } else {
            return { threadId, runId, status, isDone: false, response: null };
        }
    }

    async startNewThread(prompt: string, phase: number): Promise<WorldBuildingOutput> {
        const worldBuildingAssKey = this.configService.get<string>('WORLD_BUILDING_ASSISTANT_KEY');
        if (!worldBuildingAssKey) {
            throw new InternalServerErrorException('Error getting assistant key');
        }

        const newThreadId = await this.cgptToolsService.createCgptThread();
        await this.cgptToolsService.addCgptMessageToThread(newThreadId, this.phasePrompts[phase] + prompt);
        const newRundId = await this.cgptToolsService.runCgptMessage(newThreadId, this.jsonInstruction, worldBuildingAssKey);
        if (!newRundId) {
            throw new InternalServerErrorException('Error creating runId');
        }
        return { threadId: newThreadId, runId: newRundId, status: 'running', isDone: false, response: null };
    }

    async continueThread(threadId: string, prompt: string, phase: number): Promise<WorldBuildingOutput> {
        const worldBuildingAssKey = this.configService.get<string>('WORLD_BUILDING_ASSISTANT_KEY');
        if (!worldBuildingAssKey) {
            throw new InternalServerErrorException('Error getting assistant key');
        }

        await this.cgptToolsService.addCgptMessageToThread(threadId, this.phasePrompts[phase] + prompt);
        const newRundId = await this.cgptToolsService.runCgptMessage(threadId, this.jsonInstruction, worldBuildingAssKey);
        if (!newRundId) {
            throw new InternalServerErrorException('Error creating runId');
        }
        return { threadId, runId: newRundId, status: 'running', isDone: false, response: null };
    }

    private async parseGptAnwser(threadId: string, runId: string, phase: number): Promise<WorldBuildingOutput> {
        const response = await this.cgptToolsService.getLastAnswerInThread(threadId);
        if (!response) {
            throw new InternalServerErrorException('Error getting response after completion');
        }
        let cleanResponse = '';
        if (response?.includes('```json')) {
            cleanResponse = response.split('```json')[1]?.split('```')[0]?.trim() || '';
        } else {
            cleanResponse = response;
        }

        let responseObject;
        switch (phase) {
            case 0:
                responseObject = JSON.parse(cleanResponse) as CgptWorldBuildingOutputFirstPhase;
                break;
            case 1:
                responseObject = JSON.parse(cleanResponse) as CgptWorldBuildingOutputSecondPhase;
                break;
            case 2:
                responseObject = JSON.parse(cleanResponse) as CgptWorldBuildingOutputThirdPhase;
                break;
            default:
                throw new InternalServerErrorException('Error parsing response');
        }
        return {
            threadId, runId, status: 'completed', isDone: true, response: responseObject
        }

    }
}