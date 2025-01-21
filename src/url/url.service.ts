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

    const url = await this.urlRepository.create({ originalUrl, shortUrl });
    return { shortUrl: url.shortUrl, alias: url.alias };
  }

  async getUrl(shortUrl: string) {
    return this.urlRepository.findOne({
      where: { shortUrl },
      rejectOnEmpty: undefined,
    });
  }

  async deleteUrl(shortUrl: string) {
    const url = await this.getUrl(shortUrl);
    if (!url) return false;

    await this.urlRepository.destroy({ where: { shortUrl } });
    return true;
  }

  async incrementClickCount(url: Url) {
    await url.increment('clickCount');
  }

  private generateMd5Hash(input: string): string {
    return crypto
      .createHash('md5')
      .update(input + Date.now().toString())
      .digest('hex')
      .slice(0, 8);
  }
}
