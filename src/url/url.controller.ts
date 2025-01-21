import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { UrlService } from './url.service';
import { ShortenUrlDto } from './dto/shorten-url.dto';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  async shorten(@Body() shortenUrlDto: ShortenUrlDto) {
    if (!shortenUrlDto.originalUrl) {
      throw new BadRequestException('originalUrl is required');
    }

    const shortenedUrl = await this.urlService.createShortUrl(shortenUrlDto);
    return { shortenedUrl };
  }
}
