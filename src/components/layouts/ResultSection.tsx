"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { TransactionGraph } from "@/components/layouts/TransactionGraph";
import { Node, Edge } from "@xyflow/react";
import { NavbarButton } from "../ui/resizable-navbar";
import jsPDF from "jspdf";

interface ResultSectionProps {
  visible: boolean;
  data?: {
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
  };
}

export const ResultSection = ({ visible, data }: ResultSectionProps) => {
  const [loading, setLoading] = useState(true);

  // Generate graph data based on analysis
  const generateGraphData = () => {
    if (!data) return { nodes: [], edges: [] };

    const nodes: Node[] = [
      { 
        id: "sender", 
        position: { x: 0, y: 0 }, 
        data: { 
          label: `Sender\n${data.from.slice(0, 10)}...`,
          risk: data.riskScore ? Math.min(data.riskScore, 100) : 0
        },
        style: {
          background: data.riskScore && data.riskScore > 70 ? '#fef2f2' : '#f0fdf4',
          border: data.riskScore && data.riskScore > 70 ? '2px solid #ef4444' : '2px solid #22c55e',
          borderRadius: '8px',
          padding: '10px'
        }
      },
      { 
        id: "receiver", 
        position: { x: 400, y: 0 }, 
        data: { 
          label: `Receiver\n${data.to.slice(0, 10)}...`,
          risk: 0
        },
        style: {
          background: '#f0fdf4',
          border: '2px solid #22c55e',
          borderRadius: '8px',
          padding: '10px'
        }
      }
    ];

    const edges: Edge[] = [
      { 
        id: "transaction", 
        source: "sender", 
        target: "receiver", 
        animated: true,
        label: `${data.value} ${data.token}`,
        style: {
          stroke: data.riskScore && data.riskScore > 70 ? '#ef4444' : '#22c55e',
          strokeWidth: 3
        }
      }
    ];

    // Add intermediate nodes if mixers or bridges detected
    if (data.flags?.includes('MIXER_DETECTED')) {
      nodes.splice(1, 0, {
        id: "mixer",
        position: { x: 200, y: -50 },
        data: { label: "Mixer\n⚠️ Tornado Cash" },
        style: {
          background: '#fef2f2',
          border: '2px solid #ef4444',
          borderRadius: '8px',
          padding: '10px'
        }
      });

      edges[0].target = "mixer";
      edges.push({
        id: "mixer-receiver",
        source: "mixer",
        target: "receiver",
        animated: true,
        style: {
          stroke: '#ef4444',
          strokeWidth: 3
        }
      });
    }

    return { nodes, edges };
  };

  const { nodes: exampleNodes, edges: exampleEdges } = generateGraphData();

  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  if (!visible || !data) return null;

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'SEVERE': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  function downloadReport(data: ResultSectionProps["data"], format: "pdf" | "json") {
    if (!data) return;

    if (format === "json") {
      const reportData = {
        transaction: {
          hash: data.hash,
          from: data.from,
          to: data.to,
          value: data.value,
          token: data.token,
          network: data.network,
          blockNumber: data.blockNumber,
          timestamp: data.timestamp,
          gasUsed: data.gasUsed,
          gasPrice: data.gasPrice
        },
        riskAnalysis: {
          riskScore: data.riskScore,
          riskLevel: data.riskLevel,
          flags: data.flags,
          summary: data.summary
        },
        aiAnalysis: data.aiSummary,
        generatedAt: new Date().toISOString()
      };

      const json = JSON.stringify(reportData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transaction-analysis-${data.hash?.slice(0, 10) || 'report'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text("TraceIQ - Transaction Analysis Report", 20, 30);
      
      // Transaction Details
      doc.setFontSize(14);
      doc.text("Transaction Details:", 20, 50);
      doc.setFontSize(10);
      doc.text(`Hash: ${data.hash || 'N/A'}`, 20, 60);
      doc.text(`Network: ${data.network || 'N/A'}`, 20, 70);
      doc.text(`From: ${data.from}`, 20, 80);
      doc.text(`To: ${data.to}`, 20, 90);
      doc.text(`Value: ${data.value} ${data.token}`, 20, 100);
      doc.text(`Block: ${data.blockNumber || 'N/A'}`, 20, 110);
      
      // Risk Analysis
      doc.setFontSize(14);
      doc.text("Risk Analysis:", 20, 130);
      doc.setFontSize(10);
      doc.text(`Risk Score: ${data.riskScore || 'N/A'}/100`, 20, 140);
      doc.text(`Risk Level: ${data.riskLevel || 'N/A'}`, 20, 150);
      
      if (data.flags && data.flags.length > 0) {
        doc.text("Risk Flags:", 20, 160);
        data.flags.forEach((flag, index) => {
          doc.text(`• ${flag}`, 25, 170 + (index * 10));
        });
      }
      
      // Summary
      doc.setFontSize(14);
      doc.text("Summary:", 20, 200);
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(data.summary, 170);
      doc.text(summaryLines, 20, 210);
      
      // AI Analysis
      if (data.aiSummary) {
        doc.setFontSize(14);
        doc.text("AI Analysis:", 20, 240);
        doc.setFontSize(10);
        const aiLines = doc.splitTextToSize(data.aiSummary, 170);
        doc.text(aiLines, 20, 250);
      }
      
      doc.save(`transaction-analysis-${data.hash?.slice(0, 10) || 'report'}.pdf`);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full px-4"
    >
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          📊 Analysis Results
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Processing analysis...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Transaction Details
              </h3>
              <div className="space-y-2 text-sm">
                {data.hash && (
                  <div>
                    <span className="font-medium text-gray-600">Hash:</span>
                    <span className="ml-2 font-mono text-xs break-all">{data.hash}</span>
                  </div>
                )}
                {data.network && (
                  <div>
                    <span className="font-medium text-gray-600">Network:</span>
                    <span className="ml-2 capitalize">{data.network}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-600">From:</span>
                  <span className="ml-2 font-mono text-xs">{data.from}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">To:</span>
                  <span className="ml-2 font-mono text-xs">{data.to}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Value:</span>
                  <span className="ml-2 font-semibold">{data.value} {data.token}</span>
                </div>
                {data.blockNumber && (
                  <div>
                    <span className="font-medium text-gray-600">Block:</span>
                    <span className="ml-2">{data.blockNumber}</span>
                  </div>
                )}
                {data.gasUsed && (
                  <div>
                    <span className="font-medium text-gray-600">Gas Used:</span>
                    <span className="ml-2">{data.gasUsed}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Analysis */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Risk Analysis
              </h3>
              <div className="space-y-3">
                {data.riskScore !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600">Risk Score:</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            data.riskScore >= 80 ? 'bg-red-500' :
                            data.riskScore >= 60 ? 'bg-orange-500' :
                            data.riskScore >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${data.riskScore}%` }}
                        ></div>
                      </div>
                      <span className="font-bold">{data.riskScore}/100</span>
                    </div>
                  </div>
                )}
                {data.riskLevel && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600">Risk Level:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(data.riskLevel)}`}>
                      {data.riskLevel}
                    </span>
                  </div>
                )}
                {data.flags && data.flags.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-600 block mb-2">Risk Flags:</span>
                    <div className="flex flex-wrap gap-1">
                      {data.flags.map((flag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                        >
                          {flag.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Agent Summary */}
            <div className="lg:col-span-2 bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                🧠 AI Agent Summary
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {data.aiSummary || data.summary}
              </p>
            </div>

            {/* Transaction Graph */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🔍 Transaction Flow
              </h3>
              <div className="bg-gray-50 rounded-lg p-4" style={{ height: "300px" }}>
                <TransactionGraph nodes={exampleNodes} edges={exampleEdges} />
              </div>
            </div>

            {/* Download Reports */}
            <div className="lg:col-span-2 flex justify-center space-x-4">
              <NavbarButton
                onClick={() => downloadReport(data, "pdf")}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
              >
                📄 Download PDF Report
              </NavbarButton>
              <NavbarButton
                onClick={() => downloadReport(data, "json")}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
              >
                📊 Download JSON Data
              </NavbarButton>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
