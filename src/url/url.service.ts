import { Injectable } from '@nestjs/common';
import { ShortenUrlDto } from './dto/shorten-url.dto';

@Injectable()
export class UrlService {
  async createShortUrl(shortenUrlDto: ShortenUrlDto) {
    return shortenUrlDto;
  }
}
