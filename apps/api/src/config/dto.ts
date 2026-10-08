import { IsBoolean } from 'class-validator';

export class InterruptorLlmDto {
  @IsBoolean()
  habilitado!: boolean;
}
