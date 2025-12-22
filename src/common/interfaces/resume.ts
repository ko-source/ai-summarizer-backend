export interface ExperienceItem {
  company?: string;
  title?: string;
  startDate?: string;
  endDate?: string | null;
  description?: string;
  location?: string;
}

export interface EducationItem {
  institution?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string | null;
  score?: string;
}

export interface ExtractedResumeData {
  experience?: ExperienceItem[];
  education?: EducationItem[];
  techStack?: string[];
}

export interface JsonSchemaAnyOf {
  type: string;
}

export interface JsonSchemaProperty {
  type?: string;
  description?: string;
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  anyOf?: JsonSchemaAnyOf[];
}

export interface JsonSchema {
  type: string;
  properties: Record<string, JsonSchemaProperty>;
}

export interface ExtractionAgent {
  id: string;
  name: string;
  data_schema: JsonSchema;
}

export interface FileUploadResponse {
  id: string;
  name: string;
}

type JobStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

export interface ExtractionJob {
  id: string;
  status: JobStatus;
  extraction_agent_id: string;
  file_id: string;
}

export interface ExtractionResult {
  data: ExtractedResumeData;
}
