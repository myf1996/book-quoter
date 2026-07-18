import { DataSource } from 'typeorm';
import { BindingType } from '../../entities/binding-type.entity';
import { CoverFinish } from '../../entities/cover-finish.entity';
import { CoverStyle } from '../../entities/cover-style.entity';
import { PaperStock } from '../../entities/paper-stock.entity';
import { PrintType } from '../../entities/print-type.entity';
import { TrimSize } from '../../entities/trim-size.entity';
import { Quote } from '../../entities/quote.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432'),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? '',
  database: process.env.DATABASE_NAME ?? 'quoter_db',
  entities: [TrimSize, CoverStyle, CoverFinish, PrintType, PaperStock, BindingType, Quote],
  synchronize: true,
});

async function seed(): Promise<void> {
  await dataSource.initialize();

  await dataSource.getRepository(TrimSize).save([
    { name: 'Digest', width: 5.5, height: 8.5 },
    { name: 'Trade Paperback', width: 6.0, height: 9.0 },
    { name: '8x10', width: 8.0, height: 10.0 },
    { name: 'Hardcover', width: 6.5, height: 9.5 },
    { name: 'Square', width: 8.5, height: 8.5 },
  ]);

  await dataSource.getRepository(CoverStyle).save([
    { name: 'Softcover' },
    { name: 'Hardcover' },
    { name: 'Dust Jacket' },
  ]);

  await dataSource.getRepository(CoverFinish).save([
    { name: 'Gloss' },
    { name: 'Matte' },
    { name: 'Textured' },
  ]);

  await dataSource.getRepository(PrintType).save([
    { name: 'Black & White' },
    { name: 'Color' },
  ]);

  await dataSource.getRepository(PaperStock).save([
    { name: '60lb Natural', weight: '60' },
    { name: '70lb White', weight: '70' },
    { name: '80lb White', weight: '80' },
  ]);

  await dataSource.getRepository(BindingType).save([
    { name: 'Perfect Bind' },
    { name: 'Saddle Stitch' },
    { name: 'Spiral' },
  ]);

  console.warn('Seed complete.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
