import { NextRequest, NextResponse } from 'next/server';
import { AnalysisService } from '@/lib/services/analysis';
import { AnalysisRequest } from '@/types';

const analysisService = new AnalysisService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    if (!body.txHash) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaction hash is required',
          message: 'Please provide a valid transaction hash'
        },
        { status: 400 }
      );
    }

    // Prepare analysis request
    const analysisRequest: AnalysisRequest = {
      txHash: body.txHash,
      network: body.network || 'ethereum',
      includePathTracing: body.includePathTracing || true,
      riskThreshold: body.riskThreshold || 50
    };

    console.log('Processing analysis request:', analysisRequest);

    // Perform analysis
    const result = await analysisService.analyzeTransaction(analysisRequest);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const txHash = searchParams.get('txHash');
    const network = searchParams.get('network') || 'ethereum';
    const includePathTracing = searchParams.get('includePathTracing') === 'true';

    if (!txHash) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaction hash is required',
          message: 'Please provide a valid transaction hash'
        },
        { status: 400 }
      );
    }

    const analysisRequest: AnalysisRequest = {
      txHash,
      network,
      includePathTracing,
      riskThreshold: 50
    };

    const result = await analysisService.analyzeTransaction(analysisRequest);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request'
      },
      { status: 500 }
    );
  }
}