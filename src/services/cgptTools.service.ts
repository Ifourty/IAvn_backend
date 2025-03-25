/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CgptToolsService {
    private readonly apiUrl: string = 'https://api.openai.com/v1/';

    constructor(private readonly configService: ConfigService) { }

    private getApiKey(): string {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY n\'est pas défini');
        }
        return apiKey;
    }

    private getHeaders(): Record<string, string> {
        const apiKey = this.getApiKey();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v2',
        }
    }
    async createCgptThread(): Promise<string> {
        const url = this.apiUrl + 'threads';
        try {
            const response = await axios.post(url, {}, { headers: this.getHeaders(), });
            if (!response) {
                throw new InternalServerErrorException('Error creating thread');
            }
            const threadId = response.data.id;
            return threadId;
        } catch (error) {
            throw new Error(`Error creating thread: ${error.message}`);
        }
    }

    async addCgptMessageToThread(threadId: string, text: string): Promise<string | null> {
        const url = `${this.apiUrl}threads/${threadId}/messages`;
        const postFields = {
            role: 'user',
            content: text,
        };

        try {
            const response = await axios.post(url, postFields, { headers: this.getHeaders() });
            if (!response || !response.data) {
                throw new InternalServerErrorException('Error adding message to thread');
            }
            const messageId = response.data.id ?? null;
            return messageId;
        } catch (error) {
            throw new Error(`Error adding message to thread: ${error.message}`);
        }
    }

    async runCgptMessage(threadId: string, instruction: string, assistantId: string): Promise<string | null> {
        const url = `${this.apiUrl}threads/${threadId}/runs`;
        const data = {
            assistant_id: assistantId,
            instructions: instruction,
        };

        try {
            const response = await axios.post(url, data, { headers: this.getHeaders() });
            if (!response || !response.data) {
                throw new InternalServerErrorException('Error running message on thread');
            }
            const runId = response.data.id ?? null;
            return runId;
        } catch (error) {
            throw new Error(`Error running message on thread: ${error.message}`);
        }
    }

    async checkRunStatus(threadId: string, runId: string): Promise<string | null> {
        const url = `${this.apiUrl}threads/${threadId}/runs/${runId}`;
        try {
            const response = await axios.get(url, { headers: this.getHeaders() });
            if (!response || !response.data) {
                throw new InternalServerErrorException('Error checking run status');
            }
            const status = response.data.status ?? null;
            return status;
        } catch (error) {
            throw new Error(`Error checking run status: ${error.message}, threadId : ${threadId}, runId : ${runId}, error : ${error}`);
        }
    }

    async getLastAnswerInThread(threadId: string): Promise<string | null> {
        const url = `${this.apiUrl}threads/${threadId}/messages`;
        try {
            const response = await axios.get(url, { headers: this.getHeaders() });
            if (!response || !response.data || !response.data.data || response.data.data.length === 0) {
                throw new InternalServerErrorException('Error retrieving messages from thread');
            }
            const messageContent = response.data.data[0]?.content?.[0]?.text?.value ?? null;
            return messageContent;
        } catch (error) {
            throw new Error(`Error retrieving last answer in thread: ${error.message}`);
        }
    }
}
