import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgendaItem, AgendaItemSchema } from '../schemas/agenda-item.schema.js';
import { AgendaItemsService } from './agenda-items.service.js';
import { AgendaItemsController } from './agenda-items.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AgendaItem.name, schema: AgendaItemSchema }]),
  ],
  controllers: [AgendaItemsController],
  providers: [AgendaItemsService],
  exports: [AgendaItemsService],
})
export class AgendaItemsModule {}
