import { Module } from '@nestjs/common';
import { RecurringService } from './recurring.service';
import { RecurringController } from './recurring.controller'; // Import Controller
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecurringController], // Add Controller
  providers: [RecurringService],
  exports: [RecurringService],
})
export class RecurringModule {}
