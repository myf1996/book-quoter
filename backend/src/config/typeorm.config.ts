import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TrimSize } from '../entities/trim-size.entity';
import { CoverStyle } from '../entities/cover-style.entity';
import { CoverFinish } from '../entities/cover-finish.entity';
import { PrintType } from '../entities/print-type.entity';
import { PaperStock } from '../entities/paper-stock.entity';
import { BindingType } from '../entities/binding-type.entity';
import { Quote } from '../entities/quote.entity';
import { PageRate } from '../entities/page-rate.entity';
import { CoverRate } from '../entities/cover-rate.entity';
import { BindingRate } from '../entities/binding-rate.entity';

/** TypeORM connection config — reads from environment variables */
export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432'),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? '',
  database: process.env.DATABASE_NAME ?? 'quoter_db',
  entities: [TrimSize, CoverStyle, CoverFinish, PrintType, PaperStock, BindingType, Quote, PageRate, CoverRate, BindingRate],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});
