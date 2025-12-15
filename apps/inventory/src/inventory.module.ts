import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { DatabaseModule } from './database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Product } from 'apps/product/src/entities/product.entity';
import { IdempotencyModule } from '@apps/common';

@Module({
  imports: [
    DatabaseModule, 
    TypeOrmModule.forFeature([Inventory], 'default'),
    TypeOrmModule.forFeature([Product], 'mongodb'),
    IdempotencyModule, // Import idempotency module from common library
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
