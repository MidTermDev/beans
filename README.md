# BakedBeans Solana Web App

A NextJS web interface for interacting with the BakedBeans Solana miner program.

## Features

- 🔗 Wallet connection (Phantom, Solflare)
- 💰 Buy eggs with SOL
- 🐣 Hatch eggs into miners
- 📊 Real-time stats tracking
- 👥 Referral system support
- 💸 Sell eggs for SOL

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Solana wallet (Phantom or Solflare)

### Installation

```bash
cd bakedbeans_solana/web
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Configuration

The app connects to Solana mainnet using the Helius RPC endpoint configured in `lib/config.ts`.

- **Program ID**: `pXbCZRuLw4jmG5u7zk4xME4DjENUDjiTGnHqhgFWegg`
- **Network**: Solana Mainnet
- **RPC**: Helius Mainnet

## How to Use

1. **Connect Wallet**: Click the "Select Wallet" button and connect your Phantom or Solflare wallet
2. **Initialize Account**: First-time users need to initialize their account (one-time transaction)
3. **Buy Eggs**: Enter SOL amount and optionally a referrer address, then buy eggs
4. **Hatch Eggs**: Convert your eggs into miners that generate more eggs over time
5. **Sell Eggs**: Cash out your eggs for SOL (3% dev fee applies)

## Game Mechanics

### Buying Eggs
- Uses bonding curve pricing
- Price increases as more SOL enters the vault
- Early buyers get more eggs per SOL

### Hatching
- Converts eggs into miners
- Each miner generates 1 egg per second
- Production caps at 1,080,000 seconds (~12.5 days)
- 12.5% bonus goes to referrer (if set)
- 20% added to market supply

### Selling
- Converts eggs back to SOL
- Uses bonding curve pricing
- 3% dev fee on transactions

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS
- **Blockchain**: Solana Web3.js + Anchor
- **Wallet**: Solana Wallet Adapter
- **Language**: TypeScript

## Project Structure

```
web/
├── app/              # Next.js pages
│   ├── layout.tsx   # Root layout with wallet provider
│   ├── page.tsx     # Main game interface
│   └── globals.css  # Global styles
├── components/       # React components
│   └── WalletProvider.tsx
├── hooks/           # Custom React hooks
│   └── useBakedBeans.ts  # Main game logic hook
├── lib/             # Utilities and config
│   └── config.ts    # Program ID and RPC config
└── bakedbeans_solana.json  # Program IDL
```

## Troubleshooting

### Wallet Not Connecting
- Ensure you have Phantom or Solflare installed
- Make sure you're on Solana mainnet in your wallet
- Try refreshing the page

### Transaction Failing
- Check you have enough SOL for transaction fees (0.01-0.05 SOL)
- Ensure you've initialized your account first
- Verify the program is initialized on mainnet

### Stats Not Updating
- Stats refresh every 5 seconds automatically
- Check your wallet is connected
- Ensure you're on the correct network (mainnet)

## Security Notes

⚠️ **Important**: This is experimental software. Only invest what you can afford to lose.

- The smart contract is deployed on Solana mainnet
- All transactions require wallet approval
- Dev fees are hardcoded at 3%
- Contract code has been deployed to program ID: `pXbCZRuLw4jmG5u7zk4xME4DjENUDjiTGnHqhgFWegg`

## Links

- [Program Explorer](https://explorer.solana.com/address/pXbCZRuLw4jmG5u7zk4xME4DjENUDjiTGnHqhgFWegg)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

## License

MIT
