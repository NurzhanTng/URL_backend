import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Url } from './url.model';

@Module({
  controllers: [UrlController],
  providers: [UrlService],
  imports: [SequelizeModule.forFeature([Url])],
})
export class UrlModule {}
