import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { AgendaItemsModule } from './agenda-items/agenda-items.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { MovementDestinationsModule } from './movement-destinations/movement-destinations.module.js';
import { ProductsModule } from './products/products.module.js';
import { PortioningsModule } from './portionings/portionings.module.js';
import { StockItemsModule } from './stock-items/stock-items.module.js';
import { StockMovementsModule } from './stock-movements/stock-movements.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('DATABASE_USER')}:${configService.get('DATABASE_PASSWORD')}@${configService.get('DATABASE_HOST')}:${configService.get('DATABASE_PORT')}/${configService.get('DATABASE_NAME')}?authSource=admin`,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    AgendaItemsModule,
    EmployeesModule,
    MovementDestinationsModule,
    ProductsModule,
    PortioningsModule,
    StockItemsModule,
    StockMovementsModule,
  ],
})
export class AppModule {}
