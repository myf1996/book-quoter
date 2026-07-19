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

  const printTypeRepo = dataSource.getRepository(PrintType);
  const paperStockRepo = dataSource.getRepository(PaperStock);
  const coverStyleRepo = dataSource.getRepository(CoverStyle);
  const coverFinishRepo = dataSource.getRepository(CoverFinish);
  const bindingTypeRepo = dataSource.getRepository(BindingType);

  const [bw, color] = await Promise.all([
    printTypeRepo.findOneByOrFail({ name: 'Black & White' }),
    printTypeRepo.findOneByOrFail({ name: 'Color' }),
  ]);
  const [nat60, wh70, wh80] = await Promise.all([
    paperStockRepo.findOneByOrFail({ name: '60lb Natural' }),
    paperStockRepo.findOneByOrFail({ name: '70lb White' }),
    paperStockRepo.findOneByOrFail({ name: '80lb White' }),
  ]);
  const [soft, hard, dust] = await Promise.all([
    coverStyleRepo.findOneByOrFail({ name: 'Softcover' }),
    coverStyleRepo.findOneByOrFail({ name: 'Hardcover' }),
    coverStyleRepo.findOneByOrFail({ name: 'Dust Jacket' }),
  ]);
  const [gloss, matte, textured] = await Promise.all([
    coverFinishRepo.findOneByOrFail({ name: 'Gloss' }),
    coverFinishRepo.findOneByOrFail({ name: 'Matte' }),
    coverFinishRepo.findOneByOrFail({ name: 'Textured' }),
  ]);
  const [perfect, saddle, spiral] = await Promise.all([
    bindingTypeRepo.findOneByOrFail({ name: 'Perfect Bind' }),
    bindingTypeRepo.findOneByOrFail({ name: 'Saddle Stitch' }),
    bindingTypeRepo.findOneByOrFail({ name: 'Spiral' }),
  ]);

  await dataSource.getRepository(PageRate).save([
    { printType: bw,    paperStock: nat60, ratePerPage: 0.0350 },
    { printType: bw,    paperStock: wh70,  ratePerPage: 0.0400 },
    { printType: bw,    paperStock: wh80,  ratePerPage: 0.0450 },
    { printType: color, paperStock: nat60, ratePerPage: 0.0850 },
    { printType: color, paperStock: wh70,  ratePerPage: 0.0950 },
    { printType: color, paperStock: wh80,  ratePerPage: 0.1050 },
  ]);

  await dataSource.getRepository(CoverRate).save([
    { coverStyle: soft, coverFinish: gloss,    basePrice: 3.50 },
    { coverStyle: soft, coverFinish: matte,    basePrice: 4.00 },
    { coverStyle: soft, coverFinish: textured, basePrice: 4.75 },
    { coverStyle: hard, coverFinish: gloss,    basePrice: 8.00 },
    { coverStyle: hard, coverFinish: matte,    basePrice: 8.50 },
    { coverStyle: hard, coverFinish: textured, basePrice: 9.25 },
    { coverStyle: dust, coverFinish: gloss,    basePrice: 10.00 },
    { coverStyle: dust, coverFinish: matte,    basePrice: 10.50 },
    { coverStyle: dust, coverFinish: textured, basePrice: 11.25 },
  ]);

  await dataSource.getRepository(BindingRate).save([
    { bindingType: perfect, surcharge: 1.50 },
    { bindingType: saddle,  surcharge: 0.75 },
    { bindingType: spiral,  surcharge: 2.00 },
  ]);

  console.warn('Pricing seed complete.');
  await dataSource.destroy();
}

seedPricing().catch((err) => {
  console.error('Pricing seed failed:', err);
  process.exit(1);
});
