import axios from 'axios';
import { ethers } from 'ethers';
import { BlockchainTransaction, BitcoinTransaction, AddressRiskData } from '@/types';

export class BlockchainService {
  private etherscanApiKey: string;
  private alchemyApiKey: string;
  private infuraProjectId: string;
  private oklinkApiKey: string;

  constructor() {
    this.etherscanApiKey = process.env.ETHERSCAN_API_KEY || '';
    this.alchemyApiKey = process.env.ALCHEMY_API_KEY || '';
    this.infuraProjectId = process.env.INFURA_PROJECT_ID || '';
    this.oklinkApiKey = process.env.OKLINK_API_KEY || '';
  }

  async getTransactionData(txHash: string, network: string = 'ethereum'): Promise<BlockchainTransaction | null> {
    try {
      switch (network.toLowerCase()) {
        case 'ethereum':
        case 'eth':
          return await this.getEthereumTransaction(txHash);
        case 'bitcoin':
        case 'btc':
          return await this.getBitcoinTransaction(txHash);
        case 'bsc':
        case 'binance':
          return await this.getBSCTransaction(txHash);
        default:
          return await this.getEthereumTransaction(txHash);
      }
    } catch (error) {
      console.error(`Error fetching transaction data for ${txHash}:`, error);
      return null;
    }
  }

  private async getEthereumTransaction(txHash: string): Promise<BlockchainTransaction | null> {
    try {
      // First try Etherscan API
      if (this.etherscanApiKey) {
        const response = await axios.get(
          `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${this.etherscanApiKey}`
        );

        if (response.data.result) {
          const tx = response.data.result;
          
          // Get transaction receipt for gas used
          const receiptResponse = await axios.get(
            `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${this.etherscanApiKey}`
          );

          const receipt = receiptResponse.data.result;

          return {
            hash: tx.hash,
            blockNumber: parseInt(tx.blockNumber, 16),
            from: tx.from,
            to: tx.to || '',
            value: ethers.formatEther(tx.value),
            gas: parseInt(tx.gas, 16).toString(),
            gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei'),
            gasUsed: receipt ? parseInt(receipt.gasUsed, 16).toString() : '0',
            timestamp: Date.now(), // We'd need to get block data for actual timestamp
            input: tx.input,
            status: receipt ? (receipt.status === '0x1' ? 'success' : 'failed') : 'pending',
            network: 'ethereum'
          };
        }
      }

      // Fallback to Alchemy or Infura
      if (this.alchemyApiKey) {
        const provider = new ethers.AlchemyProvider('mainnet', this.alchemyApiKey);
        const tx = await provider.getTransaction(txHash);
        const receipt = await provider.getTransactionReceipt(txHash);

        if (tx) {
          return {
            hash: tx.hash,
            blockNumber: tx.blockNumber || 0,
            from: tx.from,
            to: tx.to || '',
            value: ethers.formatEther(tx.value),
            gas: tx.gasLimit.toString(),
            gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : '0',
            gasUsed: receipt ? receipt.gasUsed.toString() : '0',
            timestamp: Date.now(),
            input: tx.data,
            status: receipt ? (receipt.status === 1 ? 'success' : 'failed') : 'pending',
            network: 'ethereum'
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching Ethereum transaction:', error);
      return null;
    }
  }

  private async getBitcoinTransaction(txHash: string): Promise<BlockchainTransaction | null> {
    try {
      // Using a public Bitcoin API (you might want to use a more reliable service)
      const response = await axios.get(`https://blockstream.info/api/tx/${txHash}`);
      const tx: BitcoinTransaction = response.data;

      if (tx) {
        const outputValue = tx.vout.reduce((sum: number, output) => sum + output.value, 0);

        return {
          hash: tx.txid,
          blockNumber: tx.status?.block_height || 0,
          from: tx.vin[0]?.prevout?.scriptpubkey_address || 'Unknown',
          to: tx.vout[0]?.scriptpubkey_address || 'Unknown',
          value: (outputValue / 100000000).toString(), // Convert satoshis to BTC
          gas: '0',
          gasPrice: '0',
          gasUsed: tx.fee?.toString() || '0',
          timestamp: tx.status?.block_time ? tx.status.block_time * 1000 : Date.now(),
          input: '',
          status: tx.status?.confirmed ? 'success' : 'pending',
          network: 'bitcoin'
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching Bitcoin transaction:', error);
      return null;
    }
  }

  private async getBSCTransaction(txHash: string): Promise<BlockchainTransaction | null> {
    try {
      const response = await axios.get(
        `https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=YourApiKeyToken`
      );

      if (response.data.result) {
        const tx = response.data.result;
        
        const receiptResponse = await axios.get(
          `https://api.bscscan.com/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=YourApiKeyToken`
        );

        const receipt = receiptResponse.data.result;

        return {
          hash: tx.hash,
          blockNumber: parseInt(tx.blockNumber, 16),
          from: tx.from,
          to: tx.to || '',
          value: ethers.formatEther(tx.value),
          gas: parseInt(tx.gas, 16).toString(),
          gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei'),
          gasUsed: receipt ? parseInt(receipt.gasUsed, 16).toString() : '0',
          timestamp: Date.now(),
          input: tx.input,
          status: receipt ? (receipt.status === '0x1' ? 'success' : 'failed') : 'pending',
          network: 'bsc'
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching BSC transaction:', error);
      return null;
    }
  }

  async getAddressRiskAnalysis(address: string, network: string = 'ethereum'): Promise<AddressRiskData | null> {
    try {
      if (!this.oklinkApiKey) {
        console.warn('OKLink API key not configured');
        return null;
      }

      const networkMap: { [key: string]: string } = {
        'ethereum': 'ETH',
        'bitcoin': 'BTC',
        'bsc': 'BSC'
      };

      const oklinkNetwork = networkMap[network.toLowerCase()] || 'ETH';

      const response = await axios.get(
        `https://www.oklink.com/api/v5/tracker/kya/address-risk-level?network=${oklinkNetwork}&address=${address}`,
        {
          headers: {
            'Ok-Access-Key': this.oklinkApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching address risk analysis:', error);
      return null;
    }
  }

  async traceTransactionPath(txHash: string, network: string = 'ethereum'): Promise<BlockchainTransaction[]> {
    try {
      // This is a simplified implementation
      // In a real scenario, you'd implement complex graph traversal
      const transaction = await this.getTransactionData(txHash, network);
      if (!transaction) return [];

      const path = [transaction];
      
      // For demonstration, we'll simulate finding related transactions
      // In reality, you'd analyze input/output addresses and find connected transactions
      
      return path;
    } catch (error) {
      console.error('Error tracing transaction path:', error);
      return [];
    }
  }
}