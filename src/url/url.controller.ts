import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  GoneException,
  NotFoundException,
  Param,
  Post,
  Request,
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
  async redirect(
    @Param('shortUrl') shortUrl: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const url = await this.urlService.getUrl(shortUrl);
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    await this.urlService.logRequest(shortUrl, req.ip);

    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      throw new GoneException('This URL has expired');
    }

    await this.urlService.incrementClickCount(url);
    return res.redirect(url.originalUrl);
  }

  @Get('/alias/:alias')
  async redirectByAlias(
    @Param('alias') alias: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const url = await this.urlService.getUrlByAlias(alias);
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    await this.urlService.logRequest(url.shortUrl, req.ip);

    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      throw new GoneException('This URL has expired');
    }

    await this.urlService.incrementClickCount(url);
    return res.redirect(url.originalUrl);
  }

  @Get('info/:shortUrl')
  async getInfo(@Param('shortUrl') shortUrl: string) {
    const url = await this.urlService.getUrl(shortUrl);
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    return url;
  }

  @Delete('delete/:shortUrl')
  async delete(@Param('shortUrl') shortUrl: string) {
    const result = await this.urlService.deleteUrl(shortUrl);
    if (!result) {
      throw new NotFoundException('URL not found');
    }
  }

  @Get('analytics/:shortUrl')
  async getRecentRequests(@Param('shortUrl') shortUrl: string) {
    return await this.urlService.getRecentRequests(shortUrl);
  }
}
