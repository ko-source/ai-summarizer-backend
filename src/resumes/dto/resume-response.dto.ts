export class ResumeResponseDto {
  id: number;
  userId: number;
  fileName: string;
  experience: Array<{
    company?: string;
    title?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    location?: string;
  }>;
  education: Array<{
    institution?: string;
    area?: string;
    studyType?: string;
    startDate?: string;
    endDate?: string;
    score?: string;
  }>;
  techStack: string[];
  createdAt: Date;
}
