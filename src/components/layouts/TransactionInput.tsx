"use client";

import { useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

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
  riskScore?: number;
  riskLevel?: string;
  flags?: string[];
  aiSummary?: string;
}

export const TransactionInput = ({
  onAnalyze,
}: {
  onAnalyze: (data: TransactionData | null, loading: boolean, error?: string) => void;
}) => {
  const [txHash, setTxHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTxHash(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!txHash.trim()) {
      onAnalyze(null, false, "Please enter a transaction hash");
      return;
    }

    setIsLoading(true);
    onAnalyze(null, true);

    try {
      console.log('Submitting transaction hash:', txHash);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash: txHash.trim(),
          network: 'ethereum',
          includePathTracing: true,
          riskThreshold: 50
        }),
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to analyze transaction');
      }

      if (result.success && result.data) {
        const analysisData = result.data;
        
        // Transform the analysis data to match the expected format
        const transformedData: TransactionData = {
          from: analysisData.transactionData.from,
          to: analysisData.transactionData.to,
          value: analysisData.transactionData.value,
          token: analysisData.transactionData.token,
          summary: analysisData.riskAnalysis.summary,
          hash: analysisData.transactionData.hash,
          blockNumber: analysisData.transactionData.blockNumber,
          timestamp: analysisData.transactionData.timestamp,
          gasUsed: analysisData.transactionData.gasUsed,
          gasPrice: analysisData.transactionData.gasPrice,
          network: analysisData.transactionData.network,
          riskScore: analysisData.riskAnalysis.riskScore,
          riskLevel: analysisData.riskAnalysis.riskLevel,
          flags: analysisData.riskAnalysis.flags,
          aiSummary: analysisData.aiSummary
        };

        onAnalyze(transformedData, false);
      } else {
        throw new Error(result.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing transaction:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Provide fallback data for demo purposes if API fails
      if (txHash.toLowerCase().includes('demo') || txHash.toLowerCase().includes('test')) {
        const fallbackData: TransactionData = {
          from: "0xAlice",
          to: "0xBob",
          value: "5.2 ETH",
          token: "ETH",
          summary: "Demo transaction - Funds passed through Tornado Cash before landing on 0xBob. Risk Score: 87/100.",
          hash: txHash,
          riskScore: 87,
          riskLevel: "HIGH",
          flags: ["MIXER_DETECTED", "HIGH_RISK_TRANSACTION"],
          aiSummary: "This is a demo transaction showing high-risk patterns including mixer usage."
        };
        onAnalyze(fallbackData, false);
      } else {
        onAnalyze(null, false, errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4" id="demo">
      <PlaceholdersAndVanishInput
        placeholders={[
          "Enter transaction hash...",
          "0x123abc...",
          "Try &lsquo;demo&rsquo; for a test analysis",
          "Supports ETH, BTC, BSC networks"
        ]}
        onChange={handleChange}
        onSubmit={handleSubmit}
        disabled={isLoading}
      />

      {isLoading && (
        <div className="mt-4 text-center text-gray-600">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Analyzing transaction...
          </div>
        </div>
      )}

      {/* Demo instructions */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        <p>💡 Try entering &ldquo;demo&rdquo; or &ldquo;test&rdquo; for a sample analysis</p>
        <p>Or use a real transaction hash from Ethereum, Bitcoin, or BSC</p>
      </div>
    </div>
  );
};
