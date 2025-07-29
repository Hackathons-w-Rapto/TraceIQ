// Transaction Analysis Types
export interface TransactionData {
  from: string;
  to: string;
  value: string;
  token: string;
  summary: string;
  hash?: string;
  blockNumber?: number;
  timestamp?: number;
  gasUsed?: string;
  gasPrice?: string;
  network?: string;
}

export interface BlockchainTransaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  timestamp: number;
  input: string;
  status: string;
  network: string;
}

export interface RiskAnalysis {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
  flags: string[];
  summary: string;
  details: {
    mixerDetected: boolean;
    sanctionedAddresses: boolean;
    highRiskExchange: boolean;
    suspiciousPattern: boolean;
  };
}

export interface AgentAnalysis {
  transactionData: TransactionData;
  riskAnalysis: RiskAnalysis;
  pathTracing: {
    hops: Array<{
      from: string;
      to: string;
      value: string;
      timestamp: number;
      riskScore: number;
    }>;
    totalHops: number;
    mixersDetected: string[];
    exchangesInvolved: string[];
  };
  aiSummary: string;
}

export interface JulepAgent {
  id: string;
  name: string;
  model: string;
  instructions: string[];
  tools: Array<{
    name: string;
    description: string;
    function: Record<string, unknown>;
  }>;
}

export interface AnalysisRequest {
  txHash: string;
  network?: string;
  includePathTracing?: boolean;
  riskThreshold?: number;
}

export interface AnalysisResponse {
  success: boolean;
  data?: AgentAnalysis;
  error?: string;
  message?: string;
}

// Additional types for better type safety
export interface AddressRiskData {
  address: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
  riskScore: number;
  associateBlackAddresses: string;
  interactionTime: string;
  amount: string;
  maliciousAddressList?: Array<{
    category: string;
    value: string;
  }>;
}

export interface BitcoinTransactionInput {
  prevout?: {
    value: number;
    scriptpubkey_address?: string;
  };
}

export interface BitcoinTransactionOutput {
  value: number;
  scriptpubkey_address?: string;
}

export interface BitcoinTransaction {
  txid: string;
  status?: {
    block_height?: number;
    block_time?: number;
    confirmed?: boolean;
  };
  vin: BitcoinTransactionInput[];
  vout: BitcoinTransactionOutput[];
  fee?: number;
}