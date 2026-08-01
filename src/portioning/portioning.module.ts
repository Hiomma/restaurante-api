import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PortioningSchema } from './schemas/portioning.schema';
import { PortioningService } from './portioning.service';
import { PortioningController } from './portioning.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Portioning', schema: PortioningSchema }])],
  providers: [PortioningService],
  controllers: [PortioningController],
  exports: [PortioningService],
})
export class PortioningModule {}
