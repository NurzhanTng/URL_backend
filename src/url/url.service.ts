import { BadRequestException, Injectable } from '@nestjs/common';
import { ShortenUrlDto } from './dto/shorten-url.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Url } from './url.model';
import * as crypto from 'crypto';
import { UrlLog } from './url-logs.model';

@Injectable()
export class UrlService {
  constructor(
    @InjectModel(Url) private urlRepository: typeof Url,
    @InjectModel(UrlLog) private urlLogRepository: typeof UrlLog,
  ) {}

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
    return await this.urlRepository.findOne({
      where: { shortUrl },
      rejectOnEmpty: undefined,
    });
  }

  async getUrlByAlias(alias: string) {
    return await this.urlRepository.findOne({
      where: { alias },
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

  async logRequest(shortUrl: string, ip: string) {
    await this.urlLogRepository.create({
      shortUrl,
      ip,
    });
  }

  async getRecentRequests(shortUrl: string) {
    return await this.urlLogRepository.findAll({
      where: { shortUrl },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });
  }
}
