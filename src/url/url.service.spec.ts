import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { Url } from './url.model';
import { UrlLog } from './url-logs.model';
import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';

describe('UrlService', () => {
  let service: UrlService;
  let urlRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: getModelToken(Url),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            destroy: jest.fn(),
            increment: jest.fn(),
          },
        },
        {
          provide: getModelToken(UrlLog),
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UrlService);
    urlRepository = module.get(getModelToken(Url));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createShortUrl', () => {
    it('should create a short URL', async () => {
      const shortenUrlDto = { originalUrl: 'http://example.com' };
      const createdUrl = {
        shortUrl: 'abcd1234',
        alias: null,
        originalUrl: 'http://example.com',
      };
      urlRepository.create.mockResolvedValue(createdUrl);

      const result = await service.createShortUrl(shortenUrlDto);

      expect(result.shortUrl).toBe('abcd1234');
      expect(result.alias).toBeNull();
      expect(urlRepository.create).toHaveBeenCalledWith({
        originalUrl: 'http://example.com',
        shortUrl: expect.any(String),
        alias: null,
        expiresAt: null,
      });
    });

    it('should throw BadRequestException if alias is already in use', async () => {
      const shortenUrlDto = {
        originalUrl: 'http://example.com',
        alias: 'testAlias',
      };
      const existingUrl = { alias: 'testAlias' };
      urlRepository.findOne.mockResolvedValue(existingUrl);

      await expect(service.createShortUrl(shortenUrlDto)).rejects.toThrow(
        new BadRequestException('Alias already in use'),
      );
    });
  });

  describe('getUrl', () => {
    it('should return the URL by shortUrl', async () => {
      const mockUrl = {
        shortUrl: 'abcd1234',
        originalUrl: 'http://example.com',
      };
      urlRepository.findOne.mockResolvedValue(mockUrl);

      const result = await service.getUrl('abcd1234');

      expect(result).toEqual(mockUrl);
      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { shortUrl: 'abcd1234' },
        rejectOnEmpty: undefined,
      });
    });

    it('should return null if URL is not found', async () => {
      urlRepository.findOne.mockResolvedValue(null);

      const result = await service.getUrl('nonexistentShortUrl');

      expect(result).toBeNull();
    });
  });

  describe('deleteUrl', () => {
    it('should delete a URL', async () => {
      const mockUrl = {
        shortUrl: 'abcd1234',
        originalUrl: 'http://example.com',
      };
      urlRepository.findOne.mockResolvedValue(mockUrl);
      urlRepository.destroy.mockResolvedValue(1);

      const result = await service.deleteUrl('abcd1234');

      expect(result).toBe(true);
      expect(urlRepository.destroy).toHaveBeenCalledWith({
        where: { shortUrl: 'abcd1234' },
      });
    });

    it('should return false if URL is not found', async () => {
      urlRepository.findOne.mockResolvedValue(null);

      const result = await service.deleteUrl('nonexistentShortUrl');

      expect(result).toBe(false);
    });
  });
});
