import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Portioning, PortioningSchema } from '../schemas/portioning.schema.js';
import { PortioningsService } from './portionings.service.js';
import { PortioningsController } from './portionings.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Portioning.name, schema: PortioningSchema }]),
  ],
  controllers: [PortioningsController],
  providers: [PortioningsService],
  exports: [PortioningsService],
})
export class PortioningsModule {}
