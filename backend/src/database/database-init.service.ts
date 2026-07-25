import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductStatus } from '../common/enums/product-status.enum';
import { BindingRate } from '../entities/binding-rate.entity';
import { BindingType } from '../entities/binding-type.entity';
import { CoverFinish } from '../entities/cover-finish.entity';
import { CoverRate } from '../entities/cover-rate.entity';
import { CoverStyle } from '../entities/cover-style.entity';
import { PageRate } from '../entities/page-rate.entity';
import { PaperStock } from '../entities/paper-stock.entity';
import { PrintType } from '../entities/print-type.entity';
import { TrimSize } from '../entities/trim-size.entity';

const ACTIVE = ProductStatus.ACTIVE;

/**
 * Runs once on every server start via OnApplicationBootstrap.
 * Upserts all product-catalog defaults so deployments are self-healing —
 * no manual seed command needed after schema changes.
 *
 * Pricing rates are only inserted when missing so admin edits are preserved.
 */
@Injectable()
export class DatabaseInitService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(TrimSize)     private trimSizeRepo:    Repository<TrimSize>,
    @InjectRepository(CoverStyle)   private coverStyleRepo:  Repository<CoverStyle>,
    @InjectRepository(CoverFinish)  private coverFinishRepo: Repository<CoverFinish>,
    @InjectRepository(PrintType)    private printTypeRepo:   Repository<PrintType>,
    @InjectRepository(PaperStock)   private paperStockRepo:  Repository<PaperStock>,
    @InjectRepository(BindingType)  private bindingTypeRepo: Repository<BindingType>,
    @InjectRepository(PageRate)     private pageRateRepo:    Repository<PageRate>,
    @InjectRepository(CoverRate)    private coverRateRepo:   Repository<CoverRate>,
    @InjectRepository(BindingRate)  private bindingRateRepo: Repository<BindingRate>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.seedCatalog();
      await this.seedPricingRates();
      console.warn('[DatabaseInit] Bootstrap complete.');
    } catch (err) {
      // Log but never crash the server — missing catalog data is recoverable.
      console.error('[DatabaseInit] Bootstrap failed — server is running but data may be incomplete:', err);
    }
  }

  // ─── Catalog (upsert — always authoritative) ─────────────────────────────────

  private async seedCatalog(): Promise<void> {
    await this.trimSizeRepo.upsert([
      { name: 'Digest 5.5×8.5', width: 5.5, height: 8.5,  minPages: 24, maxPages: 840, status: ACTIVE },
      { name: 'Trade 6×9',      width: 6.0, height: 9.0,  minPages: 24, maxPages: 840, status: ACTIVE },
      { name: 'Large 8.5×11',   width: 8.5, height: 11.0, minPages: 24, maxPages: 600, status: ACTIVE },
      { name: 'Hardcover 6×9',  width: 6.0, height: 9.0,  minPages: 48, maxPages: 600, status: ACTIVE },
      { name: 'Square 8×8',     width: 8.0, height: 8.0,  minPages: 24, maxPages: 400, status: ACTIVE },
    ], ['name']);

    await this.coverStyleRepo.upsert([
      { name: 'Softcover',   status: ACTIVE },
      { name: 'Hardcover',   status: ACTIVE },
      { name: 'Dust Jacket', status: ACTIVE },
    ], ['name']);

    await this.coverFinishRepo.upsert([
      { name: 'Gloss',    status: ACTIVE },
      { name: 'Matte',    status: ACTIVE },
      { name: 'Textured', status: ACTIVE },
    ], ['name']);

    await this.printTypeRepo.upsert([
      { name: 'Black & White', primaryColor: '#000000', secondaryColor: '#FFFFFF', status: ACTIVE },
      { name: 'Color',         primaryColor: null,      secondaryColor: null,      status: ACTIVE },
    ], ['name']);

    await this.paperStockRepo.upsert([
      { name: '60lb Natural', weight: '60lb', status: ACTIVE },
      { name: '70lb White',   weight: '70lb', status: ACTIVE },
      { name: '80lb White',   weight: '80lb', status: ACTIVE },
    ], ['name']);

    await this.bindingTypeRepo.upsert([
      { name: 'Perfect Bind',  status: ACTIVE },
      { name: 'Saddle Stitch', status: ACTIVE },
      { name: 'Spiral',        status: ACTIVE },
    ], ['name']);
  }

  // ─── Pricing rates (insert only if missing — preserves admin edits) ──────────

  private async seedPricingRates(): Promise<void> {
    const [bw, color] = await Promise.all([
      this.printTypeRepo.findOneByOrFail({ name: 'Black & White' }),
      this.printTypeRepo.findOneByOrFail({ name: 'Color' }),
    ]);
    const [n60, w70, w80] = await Promise.all([
      this.paperStockRepo.findOneByOrFail({ name: '60lb Natural' }),
      this.paperStockRepo.findOneByOrFail({ name: '70lb White' }),
      this.paperStockRepo.findOneByOrFail({ name: '80lb White' }),
    ]);

    const pageRates: [PrintType, PaperStock, number][] = [
      [bw,    n60, 0.0350],
      [bw,    w70, 0.0400],
      [bw,    w80, 0.0450],
      [color, n60, 0.0850],
      [color, w70, 0.0950],
      [color, w80, 0.1050],
    ];
    for (const [pt, ps, rate] of pageRates) {
      const exists = await this.pageRateRepo.findOneBy({
        printType: { id: pt.id },
        paperStock: { id: ps.id },
      });
      if (!exists) {
        await this.pageRateRepo.save({ printType: pt, paperStock: ps, ratePerPage: rate });
      }
    }

    const [soft, hard, dust] = await Promise.all([
      this.coverStyleRepo.findOneByOrFail({ name: 'Softcover' }),
      this.coverStyleRepo.findOneByOrFail({ name: 'Hardcover' }),
      this.coverStyleRepo.findOneByOrFail({ name: 'Dust Jacket' }),
    ]);
    const [gloss, matte, textured] = await Promise.all([
      this.coverFinishRepo.findOneByOrFail({ name: 'Gloss' }),
      this.coverFinishRepo.findOneByOrFail({ name: 'Matte' }),
      this.coverFinishRepo.findOneByOrFail({ name: 'Textured' }),
    ]);

    const coverRates: [CoverStyle, CoverFinish, number][] = [
      [soft, gloss,     3.50], [soft, matte,     4.00], [soft, textured,  4.75],
      [hard, gloss,     8.00], [hard, matte,     8.50], [hard, textured,  9.25],
      [dust, gloss,    10.00], [dust, matte,    10.50], [dust, textured, 11.25],
    ];
    for (const [cs, cf, price] of coverRates) {
      const exists = await this.coverRateRepo.findOneBy({
        coverStyle: { id: cs.id },
        coverFinish: { id: cf.id },
      });
      if (!exists) {
        await this.coverRateRepo.save({ coverStyle: cs, coverFinish: cf, basePrice: price });
      }
    }

    const [perfect, saddle, spiral] = await Promise.all([
      this.bindingTypeRepo.findOneByOrFail({ name: 'Perfect Bind' }),
      this.bindingTypeRepo.findOneByOrFail({ name: 'Saddle Stitch' }),
      this.bindingTypeRepo.findOneByOrFail({ name: 'Spiral' }),
    ]);

    const bindingRates: [BindingType, number][] = [
      [perfect, 1.50], [saddle, 0.75], [spiral, 2.00],
    ];
    for (const [bt, surcharge] of bindingRates) {
      const exists = await this.bindingRateRepo.findOneBy({ bindingType: { id: bt.id } });
      if (!exists) {
        await this.bindingRateRepo.save({ bindingType: bt, surcharge });
      }
    }
  }
}
