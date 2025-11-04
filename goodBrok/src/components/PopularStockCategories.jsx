// PopularStockCategories.jsx
import { useState, useEffect } from 'react';
import { Tag, Star } from 'lucide-react';
import './PopularStockCategories.css';

export default function PopularStockCategories({ onSelectStock }) {
  const [activeCategory, setActiveCategory] = useState('technology');

  const categories = {
    technology: {
      title: 'Technology',
      stocks: [
        { symbol: 'AAPL', name: 'Apple Inc.' },
        { symbol: 'MSFT', name: 'Microsoft Corporation' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.' },
        { symbol: 'META', name: 'Meta Platforms Inc.' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation' },
        { symbol: 'TSM', name: 'Taiwan Semiconductor' },
        { symbol: 'ADBE', name: 'Adobe Inc.' }
      ]
    },
    finance: {
      title: 'Finance',
      stocks: [
        { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
        { symbol: 'BAC', name: 'Bank of America Corp' },
        { symbol: 'V', name: 'Visa Inc.' },
        { symbol: 'MA', name: 'Mastercard Inc.' },
        { symbol: 'WFC', name: 'Wells Fargo & Co.' },
        { symbol: 'GS', name: 'Goldman Sachs Group' },
        { symbol: 'MS', name: 'Morgan Stanley' },
        { symbol: 'BLK', name: 'BlackRock Inc.' }
      ]
    },
    healthcare: {
      title: 'Healthcare',
      stocks: [
        { symbol: 'JNJ', name: 'Johnson & Johnson' },
        { symbol: 'UNH', name: 'UnitedHealth Group' },
        { symbol: 'PFE', name: 'Pfizer Inc.' },
        { symbol: 'ABBV', name: 'AbbVie Inc.' },
        { symbol: 'MRK', name: 'Merck & Co.' },
        { symbol: 'LLY', name: 'Eli Lilly and Company' },
        { symbol: 'BMY', name: 'Bristol-Myers Squibb' },
        { symbol: 'TMO', name: 'Thermo Fisher Scientific' }
      ]
    },
    consumer: {
      title: 'Consumer',
      stocks: [
        { symbol: 'PG', name: 'Procter & Gamble' },
        { symbol: 'KO', name: 'Coca-Cola Company' },
        { symbol: 'PEP', name: 'PepsiCo Inc.' },
        { symbol: 'COST', name: 'Costco Wholesale' },
        { symbol: 'WMT', name: 'Walmart Inc.' },
        { symbol: 'MCD', name: "McDonald's Corp" },
        { symbol: 'NKE', name: 'Nike Inc.' },
        { symbol: 'SBUX', name: 'Starbucks Corp' }
      ]
    },
    energy: {
      title: 'Energy',
      stocks: [
        { symbol: 'XOM', name: 'Exxon Mobil Corp' },
        { symbol: 'CVX', name: 'Chevron Corporation' },
        { symbol: 'COP', name: 'ConocoPhillips' },
        { symbol: 'SLB', name: 'Schlumberger N.V.' },
        { symbol: 'EOG', name: 'EOG Resources' },
        { symbol: 'OXY', name: 'Occidental Petroleum' },
        { symbol: 'BP', name: 'BP p.l.c.' },
        { symbol: 'RDS-A', name: 'Royal Dutch Shell' }
      ]
    },
    indices: {
      title: 'Indices ETFs',
      stocks: [
        { symbol: 'SPY', name: 'S&P 500 ETF' },
        { symbol: 'QQQ', name: 'Nasdaq 100 ETF' },
        { symbol: 'DIA', name: 'Dow Jones Industrial ETF' },
        { symbol: 'IWM', name: 'Russell 2000 ETF' },
        { symbol: 'EFA', name: 'MSCI EAFE ETF' },
        { symbol: 'VTI', name: 'Vanguard Total Stock Market' },
        { symbol: 'VGK', name: 'Vanguard FTSE Europe' },
        { symbol: 'EEM', name: 'iShares MSCI Emerging Markets' }
      ]
    }
  };

  return (
    <div className="popular-stocks-card">
      <div className="popular-stocks-header">
        <Star size={18} />
        <h2 className="popular-stocks-title">Popular Stocks</h2>
      </div>
      
      <div className="categories-tabs">
        {Object.keys(categories).map(category => (
          <button
            key={category}
            className={`category-tab ${activeCategory === category ? 'active-tab' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {categories[category].title}
          </button>
        ))}
      </div>
      
      <div className="stocks-grid">
        {categories[activeCategory].stocks.map(stock => (
          <button
            key={stock.symbol}
            className="stock-item"
            onClick={() => onSelectStock(stock.symbol)}
          >
            <span className="stock-symbol">{stock.symbol}</span>
            <span className="stock-name">{stock.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}