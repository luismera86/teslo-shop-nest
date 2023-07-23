import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: +process.env.DB_PORT || 5432,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'test',
      autoLoadEntities: true,
      entities: [],
      synchronize: true, // Cuando se realiza un cambio en las entidades, se sincroniza con la base de datos, no se utiliza en producción
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
