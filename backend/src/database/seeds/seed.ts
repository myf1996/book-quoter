import * as bcrypt from 'bcrypt';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ProductStatus } from '../../common/enums/product-status.enum';
import { BindingRate } from '../../entities/binding-rate.entity';
import { BindingType } from '../../entities/binding-type.entity';
import { Coupon } from '../../entities/coupon.entity';
import { CouponUsage } from '../../entities/coupon-usage.entity';
import { CoverFinish } from '../../entities/cover-finish.entity';
import { CoverRate } from '../../entities/cover-rate.entity';
import { CoverStyle } from '../../entities/cover-style.entity';
import { PageRate } from '../../entities/page-rate.entity';
import { PaperStock } from '../../entities/paper-stock.entity';
import { PrintType } from '../../entities/print-type.entity';
import { Quote } from '../../entities/quote.entity';
import { TrimSize } from '../../entities/trim-size.entity';
import { User, UserRole } from '../../entities/user.entity';

const entities = [
  TrimSize, CoverStyle, CoverFinish, PrintType, PaperStock, BindingType,
  Quote, PageRate, CoverRate, BindingRate, User, Coupon, CouponUsage,
];

const baseOptions: Partial<DataSourceOptions> = {
  entities,
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: true,
};

const dataSource = process.env.DATABASE_URL
  ? new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      ...baseOptions,
    } as DataSourceOptions)
  : new DataSource({
      type: 'postgres',
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: parseInt(process.env.DATABASE_PORT ?? '5432'),
      username: process.env.DATABASE_USER ?? 'postgres',
      password: process.env.DATABASE_PASSWORD ?? '',
      database: process.env.DATABASE_NAME ?? 'quoter_db',
      ...baseOptions,
    } as DataSourceOptions);

const ACTIVE = ProductStatus.ACTIVE;

async function seed(): Promise<void> {
  await dataSource.initialize();

  // Use upsert so the script is safe to re-run
  await dataSource.getRepository(TrimSize).upsert([
    { name: 'Digest 5.5×8.5',  width: 5.5, height: 8.5,  minPages: 24, maxPages: 840, status: ACTIVE },
    { name: 'Trade 6×9',        width: 6.0, height: 9.0,  minPages: 24, maxPages: 840, status: ACTIVE },
    { name: 'Large 8.5×11',     width: 8.5, height: 11.0, minPages: 24, maxPages: 600, status: ACTIVE },
    { name: 'Hardcover 6×9',    width: 6.0, height: 9.0,  minPages: 48, maxPages: 600, status: ACTIVE },
    { name: 'Square 8×8',       width: 8.0, height: 8.0,  minPages: 24, maxPages: 400, status: ACTIVE },
  ], ['name']);

  await dataSource.getRepository(CoverStyle).upsert([
    { name: 'Softcover',   status: ACTIVE },
    { name: 'Hardcover',   status: ACTIVE },
    { name: 'Dust Jacket', status: ACTIVE },
  ], ['name']);

  await dataSource.getRepository(CoverFinish).upsert([
    { name: 'Gloss',    status: ACTIVE },
    { name: 'Matte',    status: ACTIVE },
    { name: 'Textured', status: ACTIVE },
  ], ['name']);

  await dataSource.getRepository(PrintType).upsert([
    { name: 'Black & White', status: ACTIVE },
    { name: 'Color',         status: ACTIVE },
  ], ['name']);

  await dataSource.getRepository(PaperStock).upsert([
    { name: '60lb Natural', weight: '60lb', status: ACTIVE },
    { name: '70lb White',   weight: '70lb', status: ACTIVE },
    { name: '80lb White',   weight: '80lb', status: ACTIVE },
  ], ['name']);

  await dataSource.getRepository(BindingType).upsert([
    { name: 'Perfect Bind',  status: ACTIVE },
    { name: 'Saddle Stitch', status: ACTIVE },
    { name: 'Spiral',        status: ACTIVE },
  ], ['name']);

  // Pricing rates — look up product IDs then upsert
  const [bw, color] = await Promise.all([
    dataSource.getRepository(PrintType).findOneByOrFail({ name: 'Black & White' }),
    dataSource.getRepository(PrintType).findOneByOrFail({ name: 'Color' }),
  ]);
  const [n60, w70, w80] = await Promise.all([
    dataSource.getRepository(PaperStock).findOneByOrFail({ name: '60lb Natural' }),
    dataSource.getRepository(PaperStock).findOneByOrFail({ name: '70lb White' }),
    dataSource.getRepository(PaperStock).findOneByOrFail({ name: '80lb White' }),
  ]);

  for (const [pt, ps, rate] of [
    [bw,    n60, 0.0350],
    [bw,    w70, 0.0400],
    [bw,    w80, 0.0450],
    [color, n60, 0.0850],
    [color, w70, 0.0950],
    [color, w80, 0.1050],
  ] as const) {
    const existing = await dataSource.getRepository(PageRate).findOneBy({ printType: { id: pt.id }, paperStock: { id: ps.id } });
    if (!existing) {
      await dataSource.getRepository(PageRate).save({ printType: pt, paperStock: ps, ratePerPage: rate });
    }
  }

  const [soft, hard, dust] = await Promise.all([
    dataSource.getRepository(CoverStyle).findOneByOrFail({ name: 'Softcover' }),
    dataSource.getRepository(CoverStyle).findOneByOrFail({ name: 'Hardcover' }),
    dataSource.getRepository(CoverStyle).findOneByOrFail({ name: 'Dust Jacket' }),
  ]);
  const [gloss, matte, textured] = await Promise.all([
    dataSource.getRepository(CoverFinish).findOneByOrFail({ name: 'Gloss' }),
    dataSource.getRepository(CoverFinish).findOneByOrFail({ name: 'Matte' }),
    dataSource.getRepository(CoverFinish).findOneByOrFail({ name: 'Textured' }),
  ]);

  for (const [cs, cf, price] of [
    [soft, gloss,    3.50],
    [soft, matte,    4.00],
    [soft, textured, 4.75],
    [hard, gloss,    8.00],
    [hard, matte,    8.50],
    [hard, textured, 9.25],
    [dust, gloss,   10.00],
    [dust, matte,   10.50],
    [dust, textured,11.25],
  ] as const) {
    const existing = await dataSource.getRepository(CoverRate).findOneBy({ coverStyle: { id: cs.id }, coverFinish: { id: cf.id } });
    if (!existing) {
      await dataSource.getRepository(CoverRate).save({ coverStyle: cs, coverFinish: cf, basePrice: price });
    }
  }

  const [perfect, saddle, spiral] = await Promise.all([
    dataSource.getRepository(BindingType).findOneByOrFail({ name: 'Perfect Bind' }),
    dataSource.getRepository(BindingType).findOneByOrFail({ name: 'Saddle Stitch' }),
    dataSource.getRepository(BindingType).findOneByOrFail({ name: 'Spiral' }),
  ]);

  for (const [bt, surcharge] of [
    [perfect, 1.50],
    [saddle,  0.75],
    [spiral,  2.00],
  ] as const) {
    const existing = await dataSource.getRepository(BindingRate).findOneBy({ bindingType: { id: bt.id } });
    if (!existing) {
      await dataSource.getRepository(BindingRate).save({ bindingType: bt, surcharge });
    }
  }

  // Admin user — only create if missing
  const existingAdmin = await dataSource.getRepository(User).findOneBy({ email: 'admin@onpress.com' });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    await dataSource.getRepository(User).save({
      name: 'Admin',
      email: 'admin@onpress.com',
      passwordHash,
      role: UserRole.ADMIN,
    });
    console.warn('Admin user created: admin@onpress.com / Admin123!');
  }

  console.warn('Seed complete.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
