"use client";

import { useState } from "react";
import { MarketingNavbar } from "@/components/layouts/MarketingNavbar";
import { Hero } from "@/components/layouts/Hero";
import { HowItWorksSection } from "@/components/layouts/HowItWorksSection";
import { ResultSection } from "@/components/layouts/ResultSection";
import {
  TransactionInput,
  TransactionData,
} from "@/components/layouts/TransactionInput";
import { Footer } from "@/components/layouts/Footer";

export default function Home() {
  const [result, setResult] = useState<TransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = (data: TransactionData | null, loading: boolean, errorMessage?: string) => {
    setResult(data);
    setIsLoading(loading);
    setError(errorMessage || null);
  };

  return (
    <>
      <MarketingNavbar />
      <div className="flex flex-col space-y-10">
        <Hero />
        <HowItWorksSection />
        <TransactionInput onAnalyze={handleAnalyze} />
        
        {/* Error Display */}
        {error && !isLoading && (
          <div className="w-full px-4">
            <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Analysis Failed
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="w-full px-4">
            <div className="max-w-4xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
                <div>
                  <h3 className="text-lg font-medium text-blue-900">Analyzing Transaction</h3>
                  <p className="text-blue-700 mt-1">
                    🧠 Agent Activated – Reading and analyzing the transaction hash...
                  </p>
                  <p className="text-blue-700 mt-1">
                    🔍 Path Traced – Following the transaction across wallets and networks...
                  </p>
                  <p className="text-blue-700 mt-1">
                    📊 Risk Scored – Generating comprehensive risk assessment...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <ResultSection 
          visible={!!result && !isLoading && !error} 
          data={result || undefined} 
        />
        
        <Footer />
      </div>
    </>
  );
}
