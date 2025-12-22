
import React from 'react';
import AuctionWidget from './AuctionWidget';
import OptionChain from './OptionChain';
import TradePanel from './TradePanel';
import Heavyweights from './Heavyweights';
import SentimentWidget from './SentimentWidget';
import ActiveTrades from './ActiveTrades';
import { MarketData } from '../types';

interface DashboardProps {
  marketData: MarketData | null;
}

const Dashboard: React.FC<DashboardProps> = ({ marketData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
      <AuctionWidget marketData={marketData} />
      <OptionChain marketData={marketData} />
      <TradePanel marketData={marketData} />
      <Heavyweights marketData={marketData} />
      <SentimentWidget marketData={marketData} />
      <ActiveTrades marketData={marketData} />
    </div>
  );
};

export default Dashboard;
