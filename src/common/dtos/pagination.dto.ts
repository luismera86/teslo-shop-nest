import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {


  @IsOptional()
  @IsPositive()
  @Type(() => Number) // Le decimos a class-transformer que el valor que reciba lo convierta a un número
  limit?: number;

  @IsOptional()
  @IsPositive()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}