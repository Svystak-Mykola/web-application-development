import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class UpdateAutoPartDto {
  @IsOptional() @IsString() @IsNotEmpty() title?: string;
  @IsOptional() @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsString() @IsNotEmpty() oemCode?: string;
  @IsOptional() @IsString() @IsNotEmpty() condition?: string;
  @IsOptional() @IsString() @IsNotEmpty() carBrand?: string;
}
