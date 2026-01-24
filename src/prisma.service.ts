import { Injectable } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPostgresAdapter } from '@prisma/adapter-ppg';

@Injectable()
export class PrismaService extends PrismaClient {
   constructor() {
    const adapter = new PrismaPostgresAdapter({ connectionString: process.env.DATABASE_URL! });
    super({ adapter });
  }
}