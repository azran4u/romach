import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config/app-config.service';
import { GraphQLClient } from 'graphql-request';
import { RomachApiJwtIssuerService } from '../romach-api-jwt-issuer/romach-api-jwt-issuer.service';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import fetch, { RequestInit } from 'node-fetch';

@Injectable()
export class RomachApiGraphqlClientService {
  private client: GraphQLClient;

  constructor(
    private appConfigService: AppConfigService,
    private romachJwtService: RomachApiJwtIssuerService,
  ) {
    const config = this.appConfigService.get();
    const url = config.romach.entitiesApi.url;
    const timeout = config.romach.entitiesApi.timeout;

    const enhancedFetch: any = async (_url: any, options?: RequestInit) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      options.signal = controller.signal;

      options.agent =
        new URL(url).protocol === 'https:'
          ? new HttpsAgent({ timeout, rejectUnauthorized: false })
          : new HttpAgent({ timeout });

      try {
        const response = await fetch(_url, options);
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out');
        }
        throw error;
      }
    };

    this.client = new GraphQLClient(url, {
      fetch: enhancedFetch,
    });
  }

  async query<T>(query: string, variables?: any): Promise<T> {
    const token = await this.romachJwtService.getToken();
    if (!token) {
      throw new Error('No API token');
    }
    this.client.setHeader('Authorization', `Bearer ${token}`);
    return this.client.request<T>(query, variables);
  }
}
