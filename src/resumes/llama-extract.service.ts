import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import type { File as MulterFile } from 'multer';
import {
  JsonSchema,
  ExtractionAgent,
  FileUploadResponse,
  ExtractionJob,
  ExtractionResult,
} from '../common/interfaces/resume';

@Injectable()
export class LlamaExtractService {
  private readonly logger = new Logger(LlamaExtractService.name);
  private readonly apiKey = process.env.LLAMA_CLOUD_API_KEY;
  private readonly baseUrl = 'https://api.cloud.llamaindex.ai/api/v1';
  private readonly axiosInstance: AxiosInstance;
  private readonly agentName = 'resume_extractor';

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
      },
      timeout: 60000,
    });
  }

  async getOrCreateAgent(projectId?: string): Promise<string> {
    try {
      const getAgentUrl = projectId
        ? `/extraction/extraction-agents/by-name/${this.agentName}?project_id=${projectId}`
        : `/extraction/extraction-agents/by-name/${this.agentName}`;

      try {
        const response = await this.axiosInstance.get<ExtractionAgent>(
          getAgentUrl,
        );
        this.logger.log(`Found existing agent: ${response.data.id}`);
        return response.data.id;
      } catch (error) {
        this.logger.log('Agent not found, creating new agent...');
      }

      const agentData = {
        name: this.agentName,
        data_schema: this.getResumeSchema(),
        config: {
          extraction_target: 'PER_DOC',
          extraction_mode: 'BALANCED',
        },
      };

      const createUrl = projectId
        ? `/extraction/extraction-agents?project_id=${projectId}`
        : '/extraction/extraction-agents';

      const response = await this.axiosInstance.post<ExtractionAgent>(
        createUrl,
        agentData,
      );

      this.logger.log(`Created new agent: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      this.logger.error('Error getting/creating agent:', error);
      throw new Error('Failed to get or create extraction agent');
    }
  }

  async uploadFile(file: MulterFile): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('upload_file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const response = await this.axiosInstance.post<FileUploadResponse>(
        '/files',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        },
      );

      this.logger.log(`File uploaded: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async runExtractionJob(
    extractionAgentId: string,
    fileId: string,
  ): Promise<string> {
    try {
      const response = await this.axiosInstance.post<ExtractionJob>(
        '/extraction/jobs',
        {
          extraction_agent_id: extractionAgentId,
          file_id: fileId,
        },
      );

      this.logger.log(`Extraction job started: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      this.logger.error('Error running extraction job:', error);
      throw new Error('Failed to run extraction job');
    }
  }

  async pollJobStatus(jobId: string): Promise<ExtractionJob> {
    const maxAttempts = 30;
    const delayMs = 2000; // 2 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.axiosInstance.get<ExtractionJob>(
          `/extraction/jobs/${jobId}`,
        );

        const job = response.data;

        if (job.status === 'SUCCESS') {
          this.logger.log(`Job completed: ${jobId}`);
          return job;
        }

        if (job.status === 'FAILED') {
          throw new Error('Extraction job failed');
        }

        this.logger.log(
          `Job ${jobId} status: ${job.status}, attempt ${attempt + 1}/${maxAttempts}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } catch (error) {
        if (error instanceof Error && error.message === 'Extraction job failed') {
          throw error;
        }
        this.logger.error(`Error polling job status: ${error}`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw new Error('Extraction job timeout');
  }

  async getExtractionResults(jobId: string): Promise<ExtractionResult> {
    try {
      const response = await this.axiosInstance.get<ExtractionResult>(
        `/extraction/jobs/${jobId}/result`,
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error getting extraction results:', error);
      throw new Error('Failed to get extraction results');
    }
  }

  private getResumeSchema(): JsonSchema {
    return {
      type: 'object',
      properties: {
        experience: {
          type: 'array',
          description: 'Work experience history',
          items: {
            type: 'object',
            properties: {
              company: {
                type: 'string',
                description: 'Company name',
              },
              title: {
                type: 'string',
                description: 'Job title or position',
              },
              startDate: {
                type: 'string',
                description: 'Start date of employment',
              },
              endDate: {
                anyOf: [{ type: 'string' }, { type: 'null' }],
                description: 'End date of employment (null if current)',
              },
              description: {
                type: 'string',
                description: 'Job description or responsibilities',
              },
              location: {
                type: 'string',
                description: 'Job location',
              },
            },
          },
        },
        education: {
          type: 'array',
          description: 'Educational background',
          items: {
            type: 'object',
            properties: {
              institution: {
                type: 'string',
                description: 'Educational institution name',
              },
              area: {
                type: 'string',
                description: 'Field of study or major',
              },
              studyType: {
                type: 'string',
                description: 'Degree type (e.g., Bachelor, Master, PhD)',
              },
              startDate: {
                type: 'string',
                description: 'Start date of education',
              },
              endDate: {
                anyOf: [{ type: 'string' }, { type: 'null' }],
                description: 'End date or graduation date',
              },
              score: {
                type: 'string',
                description: 'GPA or grade',
              },
            },
          },
        },
        techStack: {
          type: 'array',
          description: 'Technical skills, programming languages, frameworks, and tools',
          items: {
            type: 'string',
          },
        },
      },
    };
  }
}
