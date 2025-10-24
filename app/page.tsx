'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useBakedBeans } from '@/hooks/useBakedBeans';
import { useState, useEffect } from 'react';
import { ChickenLogo } from '@/components/ChickenLogo';

export default function Home() {
  const { connected } = useWallet();
  const {
    userStats,
    globalStats,
    loading,
    isInitialized,
    initUser,
    buyEggs,
    hatchEggs,
    sellEggs,
  } = useBakedBeans();

  const [buyAmount, setBuyAmount] = useState('0.01');
  const [timeUntilFullProduction, setTimeUntilFullProduction] = useState(0);
  const [predictedChickens, setPredictedChickens] = useState(0);
  const [predictedSolPayout, setPredictedSolPayout] = useState(0);

  useEffect(() => {
    if (userStats) {
      const now = Math.floor(Date.now() / 1000);
      const timeSinceHatch = now - userStats.lastHatch;
      const timeRemaining = Math.max(0, 1_080_000 - timeSinceHatch);
      setTimeUntilFullProduction(timeRemaining);
    }
  }, [userStats]);

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  const getMinersFromHatch = () => {
    if (!userStats) return 0;
    return Math.floor(userStats.eggs / 10_000);
  };

  const calculateTrade = (rt: number, rs: number, bs: number) => {
    const PSN = 100;
    const PSNH = 100000;
    const numerator = PSN * bs;
    const denominator = PSNH + (PSN * rs + PSNH * rt) / rt;
    return Math.floor(numerator / denominator);
  };

  useEffect(() => {
    const calculateChickens = async () => {
      if (!globalStats || !buyAmount || parseFloat(buyAmount) <= 0) {
        setPredictedChickens(0);
        return;
      }

      try {
        const lamports = parseFloat(buyAmount) * 1e9;
        const marketEggs = parseInt(globalStats.marketEggs);
        const estimatedVaultBalance = 1e9;
        
        const eggsBought = calculateTrade(lamports, estimatedVaultBalance, marketEggs);
        const devFee = Math.floor(eggsBought * 10 / 100);
        const eggsAfterFee = eggsBought - devFee;
        const chickens = Math.floor(eggsAfterFee / 10_000);
        
        setPredictedChickens(chickens);
      } catch (err) {
        setPredictedChickens(0);
      }
    };

    calculateChickens();
  }, [buyAmount, globalStats]);

  useEffect(() => {
    const calculatePayout = () => {
      if (!globalStats || !userStats || userStats.eggs === 0) {
        setPredictedSolPayout(0);
        return;
      }

      try {
        const marketEggs = parseInt(globalStats.marketEggs);
        const estimatedVaultBalance = 1e9;
        
        const eggValue = calculateTrade(userStats.eggs, marketEggs, estimatedVaultBalance);
        const devFee = Math.floor(eggValue * 10 / 100);
        const payout = (eggValue - devFee) / 1e9;
        
        setPredictedSolPayout(payout);
      } catch (err) {
        setPredictedSolPayout(0);
      }
    };

    calculatePayout();
  }, [userStats, globalStats]);

  return (
    <div className="bg-hatched min-h-screen">
      {/* Compact Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-md border-b border-green-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 flex items-center justify-center">
              <ChickenLogo />
            </div>
            <h1 className="text-2xl font-bold text-green-900">HATCHED</h1>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="https://dexscreener.com/solana/wKwbmqBW4C8Na7pvu8Z89Bu1Y4C92JCpTp8Vuvrpump" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-black hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
            >
              $HATCH
            </a>
            <a 
              href="https://x.com/hatchedsol" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter
            </a>
            <WalletMultiButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {!connected ? (
          <div className="text-center py-16">
            <div className="mb-6 flex justify-center">
              <div className="w-32 h-32">
                <ChickenLogo />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-4">
              Welcome to HATCHED
            </h2>
            <p className="text-lg text-white drop-shadow-md max-w-xl mx-auto mb-6">
              Yield farming on Solana. Buy chickens that produce eggs, hatch for compound growth, or sell for SOL.
            </p>
            <div className="bg-white/90 rounded-lg p-4 max-w-sm mx-auto mb-6">
              <p className="text-gray-900 font-medium">Connect wallet to start</p>
            </div>
            <WalletMultiButton />
          </div>
        ) : !isInitialized ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white/90 rounded-xl shadow-xl p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-24 h-24">
                  <ChickenLogo />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Initialize Farm
              </h2>
              <p className="text-gray-700 mb-4">
                One-time setup (~0.01 SOL in fees)
              </p>
              <button
                onClick={initUser}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-700 hover:to-yellow-700 disabled:opacity-50 transition-all"
              >
                {loading ? 'Initializing...' : 'Initialize'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-4">
            {/* Stats Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white/90 rounded-lg shadow-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3 text-sm border-b pb-2">YOUR STATS</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Chickens</span>
                      <span className="text-xl font-bold text-orange-600">
                        {userStats?.miners.toLocaleString() || '0'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">1 egg/sec each</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Eggs</span>
                      <span className="text-xl font-bold text-yellow-600">
                        {userStats?.eggs.toLocaleString() || '0'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {userStats?.miners ? `+${userStats.miners}/sec` : 'Get chickens'}
                    </p>
                  </div>

                  {timeUntilFullProduction > 0 && (
                    <div>
                      <span className="text-xs text-gray-600 block mb-1">Timer</span>
                      <p className="text-xs text-blue-700 font-medium">
                        {formatTime(timeUntilFullProduction)}
                      </p>
                      <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{width: `${((1_080_000 - timeUntilFullProduction) / 1_080_000 * 100)}%`}}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/90 rounded-lg shadow-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3 text-sm border-b pb-2">GLOBAL</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">TVL</span>
                    <span className="text-lg font-bold text-green-600">
                      {globalStats ? 
                        globalStats.tvl.toFixed(2) + ' SOL' : 
                        '...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Market Eggs</span>
                    <span className="text-lg font-bold text-blue-600">
                      {globalStats ? 
                        (parseInt(globalStats.marketEggs) / 1e9).toFixed(2) + 'B' : 
                        '...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Actions */}
            <div className="lg:col-span-3 space-y-4">
              {/* Buy */}
              <div className="bg-white/90 rounded-lg shadow-lg p-5">
                <h3 className="font-bold text-gray-900 mb-3 text-sm border-b pb-2">BUY CHICKENS</h3>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Amount (SOL)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900 font-semibold"
                    placeholder="0.01"
                  />
                </div>
                <button
                  onClick={() => buyEggs(parseFloat(buyAmount))}
                  disabled={loading || !buyAmount || parseFloat(buyAmount) <= 0}
                  className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 text-white font-bold py-2.5 px-4 rounded-lg hover:from-orange-700 hover:to-yellow-700 disabled:opacity-50 transition-all text-sm"
                >
                  {loading ? 'Processing...' : 'BUY'}
                </button>
              </div>

              {/* Hatch & Sell */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Hatch */}
                <div className="bg-white/90 rounded-lg shadow-lg p-5">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm border-b pb-2">HATCH EGGS</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Convert 10,000 eggs → 1 chicken. ROI in just 1 day!
                  </p>
                  {userStats && userStats.eggs >= 10_000 && (
                    <div className="bg-green-50 border border-green-300 rounded p-2 mb-3">
                      <p className="text-xs text-green-900 font-bold">
                        Ready: {getMinersFromHatch().toLocaleString()} chickens
                      </p>
                    </div>
                  )}
                  {userStats && userStats.eggs < 10_000 && (
                    <div className="bg-orange-50 border border-orange-300 rounded p-2 mb-3">
                      <p className="text-xs text-orange-900">
                        Need {(10_000 - userStats.eggs).toLocaleString()} more
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => hatchEggs()}
                    disabled={loading || !userStats?.eggs}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all text-sm"
                  >
                    {loading ? 'Processing...' : 'HATCH'}
                  </button>
                </div>

                {/* Sell */}
                <div className="bg-white/90 rounded-lg shadow-lg p-5">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm border-b pb-2">SELL EGGS</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Convert eggs to SOL. 10% fee used to buyback & burn $HATCH!
                  </p>
                  {predictedSolPayout > 0 && (
                    <div className="bg-blue-50 border border-blue-300 rounded p-2 mb-3">
                      <p className="text-xs text-blue-900 font-bold">
                        ~{predictedSolPayout.toFixed(4)} SOL
                      </p>
                    </div>
                  )}
                  {!predictedSolPayout && (
                    <div className="bg-gray-50 border border-gray-300 rounded p-2 mb-3">
                      <p className="text-xs text-gray-600">
                        No eggs to sell
                      </p>
                    </div>
                  )}
                  <button
                    onClick={sellEggs}
                    disabled={loading || !userStats?.eggs || userStats.eggs === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all text-sm"
                  >
                    {loading ? 'Processing...' : 'SELL'}
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white/90 rounded-lg shadow-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3 text-sm border-b pb-2">HOW IT WORKS</h3>
                <div className="grid md:grid-cols-3 gap-3 text-xs">
                  <div className="text-center p-3 bg-orange-50 rounded">
                    <div className="font-bold text-2xl text-orange-600 mb-1">1</div>
                    <p className="text-gray-700">Buy chickens with SOL</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="font-bold text-2xl text-green-600 mb-1">2</div>
                    <p className="text-gray-700">Hatch eggs for more chickens</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="font-bold text-2xl text-blue-600 mb-1">3</div>
                    <p className="text-gray-700">Sell eggs for SOL anytime</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <div className="bg-green-100 border border-green-400 rounded-lg p-3 max-w-3xl mx-auto mb-4">
            <p className="text-sm text-green-900">
              <span className="font-bold">Hatch your eggs daily for 1-day ROI!</span> Each chicken produces 1 egg per second. Just 10,000 eggs = 1 new chicken.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-white drop-shadow">
              <span className="font-semibold">Program ID:</span>{' '}
              <a 
                href="https://solscan.io/account/sRjNziU9MSEdRQsZwnzLDHKz4Xuzqq12bCXRzko4hat" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-mono hover:text-yellow-300 transition-colors underline"
              >
                sRjNziU9MSEdRQsZwnzLDHKz4Xuzqq12bCXRzko4hat
              </a>
            </p>
            <p className="text-xs text-white drop-shadow">
              <span className="font-semibold">Token:</span>{' '}
              <a 
                href="https://solscan.io/token/wKwbmqBW4C8Na7pvu8Z89Bu1Y4C92JCpTp8Vuvrpump" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-mono hover:text-yellow-300 transition-colors underline"
              >
                wKwbmqBW4C8Na7pvu8Z89Bu1Y4C92JCpTp8Vuvrpump
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
