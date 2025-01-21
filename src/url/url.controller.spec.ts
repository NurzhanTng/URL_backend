import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

// Мокируем UrlService
const mockUrlService = {
  createShortUrl: jest.fn(),
  getUrl: jest.fn(),
  getUrlByAlias: jest.fn(),
  logRequest: jest.fn(),
  incrementClickCount: jest.fn(),
  deleteUrl: jest.fn(),
  getRecentRequests: jest.fn(),
};

describe('UrlController', () => {
  let app: INestApplication;
  let controller: UrlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: mockUrlService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    controller = module.get(UrlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /shorten', () => {
    it('should create a shortened URL', async () => {
      mockUrlService.createShortUrl.mockResolvedValue({
        shortUrl: 'abcd12',
        alias: 'test',
      });

      const response = await request(app.getHttpServer())
        .post('/url/shorten')
        .send({ originalUrl: 'http://example.com' })
        .expect(201);

      expect(response.body.shortUrl).toBe('abcd12');
      expect(response.body.alias).toBe('test');
    });

    it('should throw BadRequestException if originalUrl is not provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/url/shorten')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('originalUrl is required');
    });
  });

  describe('GET /:shortUrl', () => {
    it('should redirect to the original URL', async () => {
      const mockUrl = {
        shortUrl: 'abcd12',
        originalUrl: 'http://example.com',
        expiresAt: null,
      };
      mockUrlService.getUrl.mockResolvedValue(mockUrl);

      const response = await request(app.getHttpServer())
        .get('/url/abcd12')
        .expect(302);

      expect(response.header.location).toBe('http://example.com');
      expect(mockUrlService.logRequest).toHaveBeenCalledWith(
        'abcd12',
        expect.any(String),
      );
      expect(mockUrlService.incrementClickCount).toHaveBeenCalledWith(mockUrl);
    });

    it('should throw NotFoundException if URL is not found', async () => {
      mockUrlService.getUrl.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/url/nonexistent')
        .expect(404);

      expect(response.body.message).toBe('URL not found');
    });

    it('should throw GoneException if URL has expired', async () => {
      const mockUrl = {
        shortUrl: 'abcd12',
        originalUrl: 'http://example.com',
        expiresAt: new Date('2024-01-01'),
      };
      mockUrlService.getUrl.mockResolvedValue(mockUrl);

      const response = await request(app.getHttpServer())
        .get('/url/abcd12')
        .expect(410);

      expect(response.body.message).toBe('This URL has expired');
    });
  });

  describe('GET /alias/:alias', () => {
    it('should redirect by alias to the original URL', async () => {
      const mockUrl = {
        shortUrl: 'abcd12',
        originalUrl: 'http://example.com',
        expiresAt: null,
      };
      mockUrlService.getUrlByAlias.mockResolvedValue(mockUrl);

      const response = await request(app.getHttpServer())
        .get('/url/alias/test')
        .expect(302);

      expect(response.header.location).toBe('http://example.com');
      expect(mockUrlService.logRequest).toHaveBeenCalledWith('abcd12', expect.any(String));
      expect(mockUrlService.incrementClickCount).toHaveBeenCalledWith(mockUrl);
    });

    it('should throw NotFoundException if alias is not found', async () => {
      mockUrlService.getUrlByAlias.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/url/alias/nonexistent')
        .expect(404);

      expect(response.body.message).toBe('URL not found');
    });

    it('should throw GoneException if URL by alias has expired', async () => {
      const mockUrl = {
        shortUrl: 'abcd12',
        originalUrl: 'http://example.com',
        expiresAt: new Date('2024-01-01'),
      };
      mockUrlService.getUrlByAlias.mockResolvedValue(mockUrl);

      const response = await request(app.getHttpServer())
        .get('/url/alias/test')
        .expect(410);

      expect(response.body.message).toBe('This URL has expired');
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
