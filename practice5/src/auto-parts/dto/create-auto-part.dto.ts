import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
export class CreateAutoPartDto {
  @IsString() @IsNotEmpty() title!: string;
  @IsNumber() @Min(0) price!: number;
  @IsString() @IsNotEmpty() oemCode!: string;
  @IsString() @IsNotEmpty() condition!: string;
  @IsString() @IsNotEmpty() carBrand!: string;
}
