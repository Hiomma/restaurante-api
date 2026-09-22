import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MovementDestination, MovementDestinationSchema } from '../schemas/movement-destination.schema.js';
import { MovementDestinationsService } from './movement-destinations.service.js';
import { MovementDestinationsController } from './movement-destinations.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MovementDestination.name, schema: MovementDestinationSchema }]),
  ],
  controllers: [MovementDestinationsController],
  providers: [MovementDestinationsService],
  exports: [MovementDestinationsService],
})
export class MovementDestinationsModule {}
