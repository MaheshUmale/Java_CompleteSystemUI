
import React from 'react';
import AuctionWidget from './AuctionWidget';
import OptionChain from './OptionChain';
import TradePanel from './TradePanel';
import Heavyweights from './Heavyweights';
import SentimentWidget from './SentimentWidget';
import ActiveTrades from './ActiveTrades';

const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
      <AuctionWidget />
      <OptionChain />
      <TradePanel />
      <Heavyweights />
      <SentimentWidget />
      <ActiveTrades />
    </div>
  );
};

export default Dashboard;
