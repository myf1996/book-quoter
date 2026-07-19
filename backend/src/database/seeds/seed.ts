import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ProductStatus } from '../../common/enums/product-status.enum';
import { BindingType } from '../../entities/binding-type.entity';
import { CoverFinish } from '../../entities/cover-finish.entity';
import { CoverStyle } from '../../entities/cover-style.entity';
import { PaperStock } from '../../entities/paper-stock.entity';
import { PrintType } from '../../entities/print-type.entity';
import { Quote } from '../../entities/quote.entity';
import { TrimSize } from '../../entities/trim-size.entity';
import { User, UserRole } from '../../entities/user.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432'),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? '',
  database: process.env.DATABASE_NAME ?? 'quoter_db',
  entities: [TrimSize, CoverStyle, CoverFinish, PrintType, PaperStock, BindingType, Quote, User],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: true,
});

const ACTIVE = ProductStatus.ACTIVE;

async function seed(): Promise<void> {
  await dataSource.initialize();

  await dataSource.getRepository(TrimSize).save([
    { name: 'Digest',         width: 5.5, height: 8.5, status: ACTIVE },
    { name: 'Trade Paperback',width: 6.0, height: 9.0, status: ACTIVE },
    { name: '8x10',           width: 8.0, height: 10.0, status: ACTIVE },
    { name: 'Hardcover',      width: 6.5, height: 9.5, status: ACTIVE },
    { name: 'Square',         width: 8.5, height: 8.5, status: ACTIVE },
  ]);

  await dataSource.getRepository(CoverStyle).save([
    { name: 'Softcover',  status: ACTIVE },
    { name: 'Hardcover',  status: ACTIVE },
    { name: 'Dust Jacket',status: ACTIVE },
  ]);

  await dataSource.getRepository(CoverFinish).save([
    { name: 'Gloss',    status: ACTIVE },
    { name: 'Matte',    status: ACTIVE },
    { name: 'Textured', status: ACTIVE },
  ]);

  await dataSource.getRepository(PrintType).save([
    { name: 'Black & White', status: ACTIVE },
    { name: 'Color',         status: ACTIVE },
  ]);

  await dataSource.getRepository(PaperStock).save([
    { name: '60lb Natural', weight: '60', status: ACTIVE },
    { name: '70lb White',   weight: '70', status: ACTIVE },
    { name: '80lb White',   weight: '80', status: ACTIVE },
  ]);

  await dataSource.getRepository(BindingType).save([
    { name: 'Perfect Bind',  status: ACTIVE },
    { name: 'Saddle Stitch', status: ACTIVE },
    { name: 'Spiral',        status: ACTIVE },
  ]);

  // Admin user
  const existing = await dataSource.getRepository(User).findOneBy({ email: 'admin@onpress.com' });
  if (!existing) {
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
