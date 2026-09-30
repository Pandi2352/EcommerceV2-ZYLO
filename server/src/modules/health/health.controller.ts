import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check API and system health status' })
  @ApiResponse({
    status: 200,
    description: 'System is healthy and operational',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-09-30T10:40:00.000Z',
        uptime: 12.34,
        service: 'ZYLO Backend API',
      },
    },
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'ZYLO Backend API',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
