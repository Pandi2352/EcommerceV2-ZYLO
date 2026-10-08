import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WarehouseType, WarehouseStatus, TransferStatus } from '../enums/warehouse.enums';

export class QueryWarehouseDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(WarehouseType)
  type?: WarehouseType;

  @IsOptional()
  @IsEnum(WarehouseStatus)
  status?: WarehouseStatus;
}

export class QueryStockTransferDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;

  @IsOptional()
  @IsString()
  warehouseId?: string;
}
