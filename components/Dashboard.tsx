
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
    <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-4 h-full">
      <div className="min-h-0 lg:row-span-1"><AuctionWidget marketData={marketData} /></div>
      <div className="min-h-0 lg:row-span-1"><OptionChain marketData={marketData} /></div>
      <div className="min-h-0 lg:row-span-1"><TradePanel marketData={marketData} /></div>
      <div className="min-h-0 lg:row-span-1"><Heavyweights marketData={marketData} /></div>
      <div className="min-h-0 lg:row-span-1"><SentimentWidget marketData={marketData} /></div>
      <div className="min-h-0 lg:row-span-1"><ActiveTrades marketData={marketData} /></div>
    </div>
  );
};

export default Dashboard;
