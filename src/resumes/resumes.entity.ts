import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { ExperienceItem, EducationItem, ExtractedResumeData } from '../common/interfaces/resume';

@Entity('resumes')
export class Resume {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', nullable: true })
  fileName: string;

  @Column({ type: 'varchar', nullable: true })
  fileId: string;

  @Column({ type: 'jsonb', nullable: true })
  experience: ExperienceItem[] | null;

  @Column({ type: 'jsonb', nullable: true })
  education: EducationItem[] | null;

  @Column({ type: 'text', array: true, default: [] })
  techStack: string[];

  @Column({ type: 'jsonb', nullable: true })
  rawData: ExtractedResumeData | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
