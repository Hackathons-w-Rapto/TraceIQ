import { BlockchainService } from './blockchain';
import { JulepAgentService } from './julep-agent';
import { AnalysisRequest, AnalysisResponse, AgentAnalysis, AddressRiskData } from '@/types';

export class AnalysisService {
  private blockchainService: BlockchainService;
  private julepService: JulepAgentService;

  constructor() {
    this.blockchainService = new BlockchainService();
    this.julepService = new JulepAgentService();
  }

  async analyzeTransaction(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      console.log(`Starting analysis for transaction: ${request.txHash}`);

      // Step 1: Fetch transaction data from blockchain
      const transaction = await this.blockchainService.getTransactionData(
        request.txHash,
        request.network || 'ethereum'
      );

      if (!transaction) {
        return {
          success: false,
          error: 'Transaction not found',
          message: 'Unable to fetch transaction data from blockchain networks'
        };
      }

      console.log('Transaction data fetched:', transaction.hash);

      // Step 2: Get risk analysis for involved addresses
      const addressRisks = await Promise.all([
        this.blockchainService.getAddressRiskAnalysis(transaction.from, transaction.network),
        this.blockchainService.getAddressRiskAnalysis(transaction.to, transaction.network)
      ]);

      console.log('Address risk analysis completed');

      // Step 3: Trace transaction path if requested
      let pathData: AddressRiskData[] = [];
      if (request.includePathTracing) {
        const pathTransactions = await this.blockchainService.traceTransactionPath(
          request.txHash,
          transaction.network
        );
        console.log(`Transaction path traced: ${pathTransactions.length} hops`);
        
        // Convert path transactions to risk data format for consistency
        pathData = pathTransactions.map(tx => ({
          address: tx.from,
          level: 'LOW' as const,
          riskScore: 0,
          associateBlackAddresses: '0',
          interactionTime: '0',
          amount: tx.value
        }));
      }

      // Step 4: Analyze with Julep AI agent
      const analysis = await this.julepService.analyzeTransaction(
        transaction,
        addressRisks.filter((risk): risk is AddressRiskData => risk !== null),
        pathData
      );

      console.log('AI analysis completed:', analysis.riskAnalysis.riskLevel);

      return {
        success: true,
        data: analysis,
        message: 'Transaction analysis completed successfully'
      };

    } catch (error) {
      console.error('Error in transaction analysis:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to complete transaction analysis'
      };
    }
  }

  async getAgentStatus(): Promise<{ status: string; agent?: unknown }> {
    try {
      const agentInfo = await this.julepService.getAgentInfo();
      return {
        status: agentInfo ? 'active' : 'inactive',
        agent: agentInfo
      };
    } catch {
      return {
        status: 'error',
        agent: null
      };
    }
  }

  async healthCheck(): Promise<{
    blockchain: boolean;
    ai: boolean;
    overall: boolean;
  }> {
    try {
      // Test blockchain service
      const blockchainHealth = await this.testBlockchainService();
      
      // Test AI service
      const aiHealth = await this.testAiService();

      return {
        blockchain: blockchainHealth,
        ai: aiHealth,
        overall: blockchainHealth && aiHealth
      };
    } catch {
      return {
        blockchain: false,
        ai: false,
        overall: false
      };
    }
  }

  private async testBlockchainService(): Promise<boolean> {
    try {
      // Test with a known Ethereum transaction
      const testTx = await this.blockchainService.getTransactionData(
        '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060', // Genesis block transaction
        'ethereum'
      );
      return testTx !== null;
    } catch {
      console.error('Blockchain service test failed');
      return false;
    }
  }

  private async testAiService(): Promise<boolean> {
    try {
      const agentInfo = await this.julepService.getAgentInfo();
      return agentInfo !== null;
    } catch {
      console.error('AI service test failed');
      return false;
    }
  }

  // Enhanced analysis with additional features
  async analyzeTransactionEnhanced(request: AnalysisRequest & {
    includeCompliance?: boolean;
    generateReport?: boolean;
    alertThreshold?: number;
  }): Promise<AnalysisResponse & {
    complianceFlags?: string[];
    reportGenerated?: boolean;
    alertTriggered?: boolean;
  }> {
    const baseAnalysis = await this.analyzeTransaction(request);
    
    if (!baseAnalysis.success || !baseAnalysis.data) {
      return baseAnalysis;
    }

    const enhanced = { ...baseAnalysis };

    // Add compliance flags
    if (request.includeCompliance) {
      enhanced.complianceFlags = this.generateComplianceFlags(baseAnalysis.data);
    }

    // Check alert threshold
    if (request.alertThreshold) {
      enhanced.alertTriggered = baseAnalysis.data.riskAnalysis.riskScore >= request.alertThreshold;
    }

    // Generate report flag
    if (request.generateReport) {
      enhanced.reportGenerated = true;
    }

    return enhanced;
  }

  private generateComplianceFlags(analysis: AgentAnalysis): string[] {
    const flags: string[] = [];

    if (analysis.riskAnalysis.details.mixerDetected) {
      flags.push('MIXER_DETECTED');
    }

    if (analysis.riskAnalysis.details.sanctionedAddresses) {
      flags.push('SANCTIONED_ADDRESS');
    }

    if (analysis.riskAnalysis.details.highRiskExchange) {
      flags.push('HIGH_RISK_EXCHANGE');
    }

    if (analysis.riskAnalysis.riskScore >= 80) {
      flags.push('HIGH_RISK_TRANSACTION');
    }

    if (analysis.pathTracing.mixersDetected.length > 0) {
      flags.push('MIXING_SERVICE_USED');
    }

    return flags;
  }
}