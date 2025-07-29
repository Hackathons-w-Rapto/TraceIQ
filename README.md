## Trace IQ - Julia OS

A sophisticated blockchain transaction analysis platform powered by AI agents for compliance and forensic investigation.

## 🚀 Features

### 🔥 AI-Powered Analysis

- **Julep AI Integration** - Advanced AI agents specialized in blockchain forensics
- **Multi-Network Support** - Ethereum, Bitcoin, BSC, and more
- **Real-time Risk Assessment** - Comprehensive risk scoring from 0-100
- **Intelligent Pattern Recognition** - Detects mixers, sanctions, and suspicious activities

### 💡 How It Works

- **🧠 Agent Activated** – AI reads and analyzes the transaction hash
- **🔍 Path Traced** – Follows transactions across wallets, bridges, and mixers  
- **📊 Risk Scored** – Returns detailed summary with suspicious activity flags
- **📄 Reports Generated** – Professional PDF and JSON reports for compliance

### 🧾 Transaction Analysis Input

- Custom animated input field (`PlaceholdersAndVanishInput`)
- Real-time API integration with blockchain networks
- Support for multiple transaction hash formats
- Demo mode for testing without real transactions

### 📈 Comprehensive Results Dashboard

- **Transaction Details** - Complete transaction metadata
- **Risk Analysis** - Visual risk indicators and compliance flags
- **AI Agent Summary** - Professional analysis suitable for law enforcement
- **Interactive Graph** - Visual transaction flow with risk indicators
- **Export Options** - PDF reports and JSON data downloads

### 🧠 Advanced AI Features

- **Julep AI Agents** - Specialized blockchain forensics AI
- **Risk Pattern Detection** - Identifies money laundering and compliance risks
- **Path Tracing** - Tracks funds across multiple hops and networks
- **Compliance Reporting** - Generates professional reports for regulatory use

### 🔗 Blockchain Integration

- **Multi-Provider Support** - Etherscan, Alchemy, Infura, OKLink
- **Real-time Data** - Live blockchain data fetching
- **Network Coverage** - Ethereum, Bitcoin, BSC with easy extensibility
- **Fallback Systems** - Multiple data sources for reliability

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- API keys (see setup guide)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd trace-iq
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your API keys
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Required API Keys

1. **Julep AI** (Required)
   - Get your key at [https://app.julep.ai](https://app.julep.ai)
   - Add to `JULEP_API_KEY`

2. **Blockchain Providers** (Choose one or more)
   - Etherscan: [https://etherscan.io/apis](https://etherscan.io/apis)
   - Alchemy: [https://alchemy.com](https://alchemy.com)
   - Infura: [https://infura.io](https://infura.io)

3. **Risk Analysis** (Optional)
   - OKLink: [https://www.oklink.com](https://www.oklink.com)

See `setup-guide.md` for detailed configuration instructions.

## 🧪 Testing

### Demo Mode
Enter "demo" or "test" in the transaction input for a sample analysis.

### Real Transactions
Use actual transaction hashes from supported networks:
- Ethereum: Get from [Etherscan](https://etherscan.io)
- Bitcoin: Get from [Blockchain.info](https://blockchain.info)
- BSC: Get from [BscScan](https://bscscan.com)

### Health Check
Visit `/api/health` to verify all services are running.

## 🏗️ Architecture

```
Frontend (Next.js)
├── Transaction Input Component
├── Results Dashboard
└── Interactive Graph Visualization

Backend API Routes
├── /api/analyze - Main analysis endpoint
├── /api/health - Service health check
└── Real-time blockchain integration

AI & Data Services
├── JulepAgentService - AI analysis
├── BlockchainService - Multi-network data
└── AnalysisService - Orchestration
```

## 📊 Supported Networks

| Network | Status | Data Sources |
|---------|--------|-------------|
| Ethereum | ✅ Full | Etherscan, Alchemy, Infura |
| Bitcoin | ✅ Basic | Public APIs |
| BSC | ✅ Full | BscScan |
| More | 🔄 Planned | Extensible architecture |

## 🔍 Risk Detection Capabilities

- **Mixer Detection** - Tornado Cash, other privacy tools
- **Sanctions Screening** - OFAC and other blocklists
- **Exchange Analysis** - High-risk exchange identification
- **Pattern Recognition** - Suspicious transaction patterns
- **Path Tracing** - Multi-hop fund tracking
- **Compliance Flags** - Regulatory risk indicators

## 📄 API Documentation

### Analyze Transaction
```bash
POST /api/analyze
{
  "txHash": "0x...",
  "network": "ethereum",
  "includePathTracing": true,
  "riskThreshold": 50
}
```

### Health Check
```bash
GET /api/health
```

## 🚀 Production Deployment

1. Set environment to production
2. Configure rate limiting
3. Set up monitoring
4. Secure API key management
5. Enable caching for blockchain data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License.

## 🔒 Security

- All API keys stored in environment variables
- No sensitive data in version control
- Rate limiting and error handling implemented
- Professional-grade security practices

## 📞 Support

- Check `setup-guide.md` for detailed setup instructions
- Review console logs for debugging
- Test health endpoint for service status
- Verify API key configuration

## 🎯 Roadmap

- [ ] Additional blockchain networks
- [ ] Advanced ML risk models
- [ ] Real-time monitoring dashboards
- [ ] Compliance workflow integration
- [ ] Multi-language support
- [ ] Enterprise features

---

**Made with ❤️ by Julia OS**
