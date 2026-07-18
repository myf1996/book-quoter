import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { BindingRate } from '../../entities/binding-rate.entity';
import { BindingType } from '../../entities/binding-type.entity';
import { CoverFinish } from '../../entities/cover-finish.entity';
import { CoverRate } from '../../entities/cover-rate.entity';
import { CoverStyle } from '../../entities/cover-style.entity';
import { PageRate } from '../../entities/page-rate.entity';
import { PaperStock } from '../../entities/paper-stock.entity';
import { PrintType } from '../../entities/print-type.entity';
import { Quote } from '../../entities/quote.entity';
import { TrimSize } from '../../entities/trim-size.entity';
import { User } from '../../entities/user.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432'),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? '',
  database: process.env.DATABASE_NAME ?? 'quoter_db',
  entities: [TrimSize, CoverStyle, CoverFinish, PrintType, PaperStock, BindingType, Quote, PageRate, CoverRate, BindingRate, User],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: true,
});

async function seedPricing(): Promise<void> {
  await dataSource.initialize();

  // page_rates: printType × paperStock
  // printTypeId 1 = Black & White, 2 = Color
  // paperStockId 1 = 60lb Natural, 2 = 70lb White, 3 = 80lb White
  await dataSource.getRepository(PageRate).save([
    { printType: { id: 1 }, paperStock: { id: 1 }, ratePerPage: 0.0350 },
    { printType: { id: 1 }, paperStock: { id: 2 }, ratePerPage: 0.0400 },
    { printType: { id: 1 }, paperStock: { id: 3 }, ratePerPage: 0.0450 },
    { printType: { id: 2 }, paperStock: { id: 1 }, ratePerPage: 0.0850 },
    { printType: { id: 2 }, paperStock: { id: 2 }, ratePerPage: 0.0950 },
    { printType: { id: 2 }, paperStock: { id: 3 }, ratePerPage: 0.1050 },
  ]);

  // cover_rates: coverStyle × coverFinish
  // coverStyleId 1 = Softcover, 2 = Hardcover, 3 = Dust Jacket
  // coverFinishId 1 = Gloss, 2 = Matte, 3 = Textured
  await dataSource.getRepository(CoverRate).save([
    { coverStyle: { id: 1 }, coverFinish: { id: 1 }, basePrice: 3.50 },
    { coverStyle: { id: 1 }, coverFinish: { id: 2 }, basePrice: 4.00 },
    { coverStyle: { id: 1 }, coverFinish: { id: 3 }, basePrice: 4.75 },
    { coverStyle: { id: 2 }, coverFinish: { id: 1 }, basePrice: 8.00 },
    { coverStyle: { id: 2 }, coverFinish: { id: 2 }, basePrice: 8.50 },
    { coverStyle: { id: 2 }, coverFinish: { id: 3 }, basePrice: 9.25 },
    { coverStyle: { id: 3 }, coverFinish: { id: 1 }, basePrice: 10.00 },
    { coverStyle: { id: 3 }, coverFinish: { id: 2 }, basePrice: 10.50 },
    { coverStyle: { id: 3 }, coverFinish: { id: 3 }, basePrice: 11.25 },
  ]);

  // binding_rates: bindingType
  // bindingTypeId 1 = Perfect Bind, 2 = Saddle Stitch, 3 = Spiral
  await dataSource.getRepository(BindingRate).save([
    { bindingType: { id: 1 }, surcharge: 1.50 },
    { bindingType: { id: 2 }, surcharge: 0.75 },
    { bindingType: { id: 3 }, surcharge: 2.00 },
  ]);

  console.warn('Pricing seed complete.');
  await dataSource.destroy();
}

seedPricing().catch((err) => {
  console.error('Pricing seed failed:', err);
  process.exit(1);
});
