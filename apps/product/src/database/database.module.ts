import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import * as joi from 'joi';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validationSchema: joi.object({
                MONGODB_URI: joi.string().required(),
            }),
        }),
        
        TypeOrmModule.forRootAsync({
        useFactory: (configService: ConfigService) => ({
            type: 'mongodb',
            url: configService.get<string>('MONGODB_URI'),
            synchronize: true,
            entities: [Product, Category],
        }),
        inject: [ConfigService],
    })],
    providers: [],
    exports: [TypeOrmModule],
})
export class DatabaseModule {}
