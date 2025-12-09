import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as joi from 'joi';
import { Inventory } from '../entities/inventory.entity';
import { Product } from 'apps/product/src/entities/product.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: joi.object({
                DB_HOST: joi.string().required(),
                DB_PORT: joi.number().required(),
                DB_USERNAME: joi.string().required(),
                DB_PASSWORD: joi.string().required(),
                DB_DATABASE: joi.string().required(),
                MONGODB_URI: joi.string().required(),
            }),
        }),
        // PostgreSQL connection for Inventory
        TypeOrmModule.forRootAsync({
            name: 'default',
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST') || 'localhost',
                port: parseInt(configService.get('DB_PORT'), 10) || 5432,
                username: configService.get('DB_USERNAME') || 'postgres',
                password: configService.get('DB_PASSWORD') || 'password',
                database: configService.get('DB_DATABASE') || 'inventory_db',
                entities: [Inventory],
                autoLoadEntities: true,
                synchronize: true, // Auto-create tables (DEV ONLY!)
            }),
            inject: [ConfigService],
        }),
        // MongoDB connection for Products
        TypeOrmModule.forRootAsync({
            name: 'mongodb',
            useFactory: (configService: ConfigService) => ({
                type: 'mongodb',
                url: configService.get('MONGODB_URI'),
                entities: [Product],
                synchronize: true,
                useUnifiedTopology: true,
            }),
            inject: [ConfigService],
        })
    ],
    exports: [TypeOrmModule]
})
export class DatabaseModule {}
