import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const config: Record<string, TypeOrmModuleOptions> = {
    production: {
      type: 'postgres',
      url: configService.get('DATABASE_URL'),
    },
    development: {
      type: 'mysql',
      host: configService.get('DATABASE_HOST'),
      port: +configService.get('DATABASE_PORT'),
      username: configService.get('DATABASE_USERNAME'),
      password: configService.get('DATABASE_PASSWORD'),
      database: configService.get('DATABASE_NAME'),
    },
  };

  const environment: string = configService.get('NODE_ENV') || 'development';

  return config[environment];
};
