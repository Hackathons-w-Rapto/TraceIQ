import Julep from '@julep/sdk';
import { BlockchainTransaction, AgentAnalysis, JulepAgent } from '@/types';

interface JulepAgentData {
  id: string;
  name: string;
  model: string;
  instructions: string[];
  tools?: Array<{
    name: string;
    description: string;
    function: Record<string, unknown>;
  }>;
}

export class JulepAgentService {
  private client: Julep;
  private agent: JulepAgentData | null = null;

  constructor() {
    const apiKey = process.env.JULEP_API_KEY;

    if (!apiKey) {
      throw new Error('JULEP_API_KEY environment variable is required');
    }

    this.client = new Julep({
      apiKey,
      environment: 'production' // Use 'dev' for development
    });
  }

  async initializeAgent(): Promise<void> {
    try {
      // Create or get existing agent
      this.agent = await this.client.agents.create({
        name: "TraceIQ-BlockchainAnalyst",
        model: "gpt-4o-mini",
        about: "A specialized AI agent for analyzing blockchain transactions and identifying suspicious activities, money laundering patterns, and compliance risks.",
        instructions: [
          "You are TraceIQ, an expert blockchain transaction analyst specializing in cryptocurrency forensics and compliance.",
          "Analyze blockchain transactions for suspicious patterns, money laundering indicators, and compliance risks.",
          "Provide detailed risk assessments with clear explanations and actionable insights.",
          "Focus on identifying mixers, sanctioned addresses, high-risk exchanges, and unusual transaction patterns.",
          "Always provide a risk score from 0-100 and classify risk levels as LOW, MEDIUM, HIGH, or SEVERE.",
          "Generate clear, professional summaries suitable for compliance teams and law enforcement.",
          "When analyzing transaction paths, identify all intermediate addresses and their risk profiles.",
          "Flag any connections to known criminal entities, darknet markets, or sanctioned jurisdictions."
        ],
        default_settings: {
          temperature: 0.3
        }
      });

      console.log('Julep agent initialized:', this.agent.id);
    } catch (error) {
      console.error('Error initializing Julep agent:', error);
      throw error;
    }
  }

  async analyzeTransaction(
    transaction: BlockchainTransaction,
    addressRisks: Array<Record<string, unknown>> = [],
    pathData: Array<Record<string, unknown>> = []
  ): Promise<AgentAnalysis> {
    try {
      if (!this.agent) {
        await this.initializeAgent();
      }

      // Create a session for this analysis
      const session = await this.client.sessions.create({
        agent: this.agent!.id,
        situation: `Analyzing blockchain transaction ${transaction.hash} on ${transaction.network} network for compliance and risk assessment.`
      });

      // Prepare the analysis prompt
      const analysisPrompt = `
        Please analyze the following blockchain transaction for risk factors and compliance issues:

        Transaction Details:
        - Hash: ${transaction.hash}
        - Network: ${transaction.network}
        - From: ${transaction.from}
        - To: ${transaction.to}
        - Value: ${transaction.value} ${transaction.network === 'bitcoin' ? 'BTC' : 'ETH'}
        - Block: ${transaction.blockNumber}
        - Status: ${transaction.status}
        - Gas Used: ${transaction.gasUsed}

        Address Risk Data:
        ${JSON.stringify(addressRisks, null, 2)}

        Transaction Path Data:
        ${JSON.stringify(pathData, null, 2)}

        Please provide a comprehensive analysis including:
        1. Risk score (0-100)
        2. Risk level (LOW/MEDIUM/HIGH/SEVERE)
        3. Specific risk flags and concerns
        4. Summary of findings
        5. Details about any mixers, sanctions, or suspicious patterns detected
        6. Professional summary suitable for compliance teams

        Format your response as a JSON object with the following structure:
        {
          "riskScore": number,
          "riskLevel": "LOW|MEDIUM|HIGH|SEVERE",
          "flags": ["flag1", "flag2"],
          "summary": "Professional summary",
          "details": {
            "mixerDetected": boolean,
            "sanctionedAddresses": boolean,
            "highRiskExchange": boolean,
            "suspiciousPattern": boolean
          },
          "aiSummary": "Detailed AI analysis",
          "pathAnalysis": {
            "totalHops": number,
            "mixersDetected": ["mixer1"],
            "exchangesInvolved": ["exchange1"]
          }
        }
      `;

      // Send message to agent
      await this.client.sessions.messages.create(session.id, {
        role: 'user',
        content: analysisPrompt
      });

      // Get agent response
      const messages = await this.client.sessions.messages.list(session.id, {
        limit: 1,
        order: 'desc'
      });

      const agentResponse = messages.items[0];
      
      let analysisResult;
      try {
        // Try to parse JSON from the response
        const responseText = Array.isArray(agentResponse.content) ? 
          agentResponse.content[0]?.text || agentResponse.content[0] : 
          agentResponse.content;
        
        analysisResult = JSON.parse(responseText as string);
      } catch {
        // Fallback if JSON parsing fails
        const responseText = Array.isArray(agentResponse.content) ? 
          agentResponse.content[0]?.text || agentResponse.content[0] : 
          agentResponse.content;

        analysisResult = {
          riskScore: 50,
          riskLevel: 'MEDIUM',
          flags: ['Analysis parsing error'],
          summary: responseText,
          details: {
            mixerDetected: false,
            sanctionedAddresses: false,
            highRiskExchange: false,
            suspiciousPattern: false
          },
          aiSummary: responseText,
          pathAnalysis: {
            totalHops: pathData.length,
            mixersDetected: [],
            exchangesInvolved: []
          }
        };
      }

      // Clean up session
      await this.client.sessions.delete(session.id);

      // Format the response
      const analysis: AgentAnalysis = {
        transactionData: {
          from: transaction.from,
          to: transaction.to,
          value: transaction.value,
          token: transaction.network === 'bitcoin' ? 'BTC' : 'ETH',
          summary: analysisResult.summary,
          hash: transaction.hash,
          blockNumber: transaction.blockNumber,
          timestamp: transaction.timestamp,
          gasUsed: transaction.gasUsed,
          gasPrice: transaction.gasPrice,
          network: transaction.network
        },
        riskAnalysis: {
          riskScore: analysisResult.riskScore,
          riskLevel: analysisResult.riskLevel,
          flags: analysisResult.flags,
          summary: analysisResult.summary,
          details: analysisResult.details
        },
        pathTracing: {
          hops: pathData.map((tx, index) => ({
            from: (tx.from as string) || 'Unknown',
            to: (tx.to as string) || 'Unknown',
            value: (tx.value as string) || '0',
            timestamp: (tx.timestamp as number) || Date.now(),
            riskScore: Math.max(0, analysisResult.riskScore - (index * 10))
          })),
          totalHops: pathData.length,
          mixersDetected: analysisResult.pathAnalysis?.mixersDetected || [],
          exchangesInvolved: analysisResult.pathAnalysis?.exchangesInvolved || []
        },
        aiSummary: analysisResult.aiSummary
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing transaction with Julep agent:', error);
      
      // Return fallback analysis
      return {
        transactionData: {
          from: transaction.from,
          to: transaction.to,
          value: transaction.value,
          token: transaction.network === 'bitcoin' ? 'BTC' : 'ETH',
          summary: 'Analysis failed - using fallback data',
          hash: transaction.hash,
          blockNumber: transaction.blockNumber,
          timestamp: transaction.timestamp,
          gasUsed: transaction.gasUsed,
          gasPrice: transaction.gasPrice,
          network: transaction.network
        },
        riskAnalysis: {
          riskScore: 0,
          riskLevel: 'LOW',
          flags: ['Analysis service unavailable'],
          summary: 'Unable to complete risk analysis due to service error',
          details: {
            mixerDetected: false,
            sanctionedAddresses: false,
            highRiskExchange: false,
            suspiciousPattern: false
          }
        },
        pathTracing: {
          hops: [],
          totalHops: 0,
          mixersDetected: [],
          exchangesInvolved: []
        },
        aiSummary: 'Transaction analysis service is currently unavailable. Please try again later.'
      };
    }
  }

  async getAgentInfo(): Promise<JulepAgent | null> {
    try {
      if (!this.agent) {
        await this.initializeAgent();
      }

      return {
        id: this.agent!.id,
        name: this.agent!.name,
        model: this.agent!.model,
        instructions: this.agent!.instructions,
        tools: this.agent!.tools || []
      };
    } catch (error) {
      console.error('Error getting agent info:', error);
      return null;
    }
  }
}