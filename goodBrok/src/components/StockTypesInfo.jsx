// StockTypesInfo.jsx
import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import './StockTypesInfo.css';

export default function StockTypesInfo() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const stockTypes = [
    {
      category: "US Exchanges",
      exchanges: [
        { name: "NYSE", description: "New York Stock Exchange" },
        { name: "NASDAQ", description: "National Association of Securities Dealers Automated Quotations" },
        { name: "AMEX", description: "American Stock Exchange" },
        { name: "OTC", description: "Over-The-Counter Markets" }
      ],
      examples: "AAPL (Apple), MSFT (Microsoft), TSLA (Tesla), AMZN (Amazon)"
    },
    {
      category: "European Exchanges",
      exchanges: [
        { name: "LSE", description: "London Stock Exchange" },
        { name: "XETRA", description: "Frankfurt Stock Exchange Electronic Trading" },
        { name: "Euronext", description: "Pan-European Exchange" },
        { name: "SIX", description: "Swiss Exchange" }
      ],
      examples: "BP (BP plc), VOD.L (Vodafone), SAP.DE (SAP), MC.PA (LVMH)"
    },
    {
      category: "Asian Exchanges",
      exchanges: [
        { name: "TSE", description: "Tokyo Stock Exchange" },
        { name: "SSE", description: "Shanghai Stock Exchange" },
        { name: "HKEX", description: "Hong Kong Stock Exchange" },
        { name: "BSE", description: "Bombay Stock Exchange" }
      ],
      examples: "7203.T (Toyota), 600519.SS (Kweichow Moutai), 0700.HK (Tencent), RELIANCE.BSE (Reliance Industries)"
    },
    {
      category: "ETFs",
      exchanges: [],
      description: "Exchange-Traded Funds that track indices, sectors, commodities, or bonds",
      examples: "SPY (S&P 500 ETF), QQQ (Nasdaq 100 ETF), VTI (Vanguard Total Stock Market), GLD (Gold ETF)"
    },
    {
      category: "REITs",
      exchanges: [],
      description: "Real Estate Investment Trusts",
      examples: "O (Realty Income), PLD (Prologis), AMT (American Tower), SPG (Simon Property Group)"
    }
  ];

  return (
    <div className="stock-types-card">
      <button 
        className="stock-types-toggle" 
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="stock-types-toggle-content">
          <Info size={18} />
          <span>Available Stock Types</span>
        </div>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      
      {isExpanded && (
        <div className="stock-types-content">
          <p className="stock-types-intro">
            You can access a wide range of stocks from different exchanges worldwide using their ticker symbols:
          </p>
          
          {stockTypes.map((type, index) => (
            <div key={index} className="stock-type-section">
              <h3 className="stock-type-title">{type.category}</h3>
              
              {type.exchanges && type.exchanges.length > 0 ? (
                <div className="exchanges-grid">
                  {type.exchanges.map((exchange, idx) => (
                    <div key={idx} className="exchange-item">
                      <span className="exchange-code">{exchange.name}</span>
                      <span className="exchange-name">{exchange.description}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="stock-type-description">{type.description}</p>
              )}
              
              <div className="stock-examples">
                <span className="examples-label">Examples:</span>
                <span className="examples-text">{type.examples}</span>
              </div>
            </div>
          ))}
          
          <div className="stock-types-note">
            <p><strong>Note:</strong> When searching for stocks outside the US markets, you may need to add the exchange suffix:</p>
            <ul className="suffix-list">
              <li><span className="suffix">.L</span> for London</li>
              <li><span className="suffix">.DE</span> for German stocks</li>
              <li><span className="suffix">.PA</span> for Paris</li>
              <li><span className="suffix">.T</span> for Tokyo</li>
              <li><span className="suffix">.SS</span> for Shanghai</li>
              <li><span className="suffix">.HK</span> for Hong Kong</li>
            </ul>
            <p>Example: "VOD.L" for Vodafone on the London Stock Exchange</p>
          </div>
        </div>
      )}
    </div>
  );
}