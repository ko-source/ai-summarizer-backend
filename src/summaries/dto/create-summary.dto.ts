import { IsString, MinLength } from 'class-validator';

export class CreateSummaryDto {
  @IsString()
  @MinLength(10, { message: 'Text must be at least 10 characters long' })
  text: string;
}
