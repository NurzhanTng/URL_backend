import {
  BadRequestException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ShortenUrlDto } from './dto/shorten-url.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Url } from './url.model';
import * as crypto from 'crypto';

@Injectable()
export class UrlService {
  constructor(@InjectModel(Url) private urlRepository: typeof Url) {}

  async createShortUrl(shortenUrlDto: ShortenUrlDto) {
    const { originalUrl, alias, expiresAt } = shortenUrlDto;

    let shortUrl: string;
    let isUnique = false;

    if (alias) {
      const existingUrl = await this.urlRepository.findOne({
        where: { alias },
        rejectOnEmpty: undefined,
      });

      if (existingUrl) {
        throw new BadRequestException('Alias already in use');
      }
    }

    while (!isUnique) {
      shortUrl = this.generateMd5Hash(originalUrl);
      const existingUrl = await this.urlRepository.findOne({
        where: { shortUrl },
        rejectOnEmpty: undefined,
      });
      isUnique = !existingUrl;
    }

    const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
    const url = await this.urlRepository.create({
      originalUrl,
      shortUrl,
      alias: alias || null,
      expiresAt: expiresAtDate,
    });
    return { shortUrl: url.shortUrl, alias: url.alias };
  }

  async getUrl(shortUrl: string) {
    const url = await this.urlRepository.findOne({
      where: { shortUrl },
      rejectOnEmpty: undefined,
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      throw new GoneException('This URL has expired');
    }
    return url;
  }

  async getUrlByAlias(alias: string) {
    const url = await this.urlRepository.findOne({
      where: { alias },
      rejectOnEmpty: undefined,
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      throw new GoneException('This URL has expired');
    }
    return url;
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
