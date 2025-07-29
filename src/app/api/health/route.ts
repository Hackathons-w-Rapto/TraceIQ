import { NextResponse } from 'next/server';
import { AnalysisService } from '@/lib/services/analysis';

const analysisService = new AnalysisService();

export async function GET() {
  try {
    const health = await analysisService.healthCheck();
    const agentStatus = await analysisService.getAgentStatus();

    return NextResponse.json({
      status: health.overall ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        blockchain: {
          status: health.blockchain ? 'up' : 'down',
          description: 'Blockchain data fetching service'
        },
        ai: {
          status: health.ai ? 'up' : 'down',
          description: 'Julep AI agent service'
        }
      },
      agent: agentStatus,
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      services: {
        blockchain: { status: 'unknown' },
        ai: { status: 'unknown' }
      }
    }, { status: 500 });
  }
}