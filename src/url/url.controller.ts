import {
  BadRequestException,
  Body,
  Controller, Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { ShortenUrlDto } from './dto/shorten-url.dto';
import { Response } from 'express';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  async shorten(@Body() shortenUrlDto: ShortenUrlDto) {
    if (!shortenUrlDto.originalUrl) {
      throw new BadRequestException('originalUrl is required');
    }
    return await this.urlService.createShortUrl(shortenUrlDto);
  }

  @Get(':shortUrl')
  async redirect(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
    const url = await this.urlService.getUrl(shortUrl);
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    await this.urlService.incrementClickCount(url);
    return res.redirect(url.originalUrl);
  }

  @Get('info/:shortUrl')
  async getInfo(@Param('shortUrl') shortUrl: string) {
    return this.urlService.getUrl(shortUrl);
  }
}
