import { Injectable } from '@nestjs/common';
import { ShortenUrlDto } from './dto/shorten-url.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Url } from './url.model';
import * as crypto from 'crypto';

@Injectable()
export class UrlService {
  constructor(@InjectModel(Url) private urlRepository: typeof Url) {}

  async createShortUrl(shortenUrlDto: ShortenUrlDto) {
    const { originalUrl } = shortenUrlDto;

    let shortUrl: string;
    let isUnique = false;

    while (!isUnique) {
      shortUrl = this.generateMd5Hash(originalUrl);
      const existingUrl = await this.urlRepository.findOne({
        where: { shortUrl },
        rejectOnEmpty: undefined,
      });
      isUnique = !existingUrl;
    }

    await this.urlRepository.create({ originalUrl, shortUrl });
    return shortUrl;
  }

  async getOriginalUrl(shortUrl: string) {
    const url = await this.urlRepository.findOne({
      where: { shortUrl },
      rejectOnEmpty: undefined,
    });
    return url?.originalUrl;
  }

  private generateMd5Hash(input: string): string {
    return crypto
      .createHash('md5')
      .update(input + Date.now().toString())
      .digest('hex')
      .slice(0, 8);
  }
}
