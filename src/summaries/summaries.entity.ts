import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity('summaries')
export class Summary {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'text' })
  originalText: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'text', array: true, default: [] })
  actionItems: string[];

  @Column({ type: 'text', array: true, default: [] })
  risks: string[];

  @Column({ type: 'text', array: true, default: [] })
  nextSteps: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
