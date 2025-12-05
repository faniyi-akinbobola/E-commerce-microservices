import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as joi from 'joi';

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
        }),
    }),
        
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_DATABASE'),
                entities: [path.join(__dirname, '/../**/*.entity{.ts,.js}')],
                migrations: [path.join(__dirname, '/../migrations/*{.ts,.js}')],
                migrationsTableName: 'migrations',
                synchronize: true, // Auto-create tables (DEV ONLY!)
            }),
        })],
    exports: [TypeOrmModule],
})
export class DatabaseModule {}
