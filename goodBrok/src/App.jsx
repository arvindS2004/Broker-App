import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, RefreshCw, AlertTriangle, Activity, DollarSign, BarChart2 } from 'lucide-react';
import './App.css';
import StockTypesInfo from './components/StockTypesInfo';
import PopularStockCategories from './components/PopularStockCategories';
import logoImage from './assets/logot.png';


const API_KEY = import.meta.env.VITE_MARKETSTACK_API_KEY;

const BASE_URL = "http://api.marketstack.com/v1";

export default function StockGuidanceApp() {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  const fetchStockData = async (stockSymbol) => {
    if (!stockSymbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      
      const latestResponse = await fetch(
        `${BASE_URL}/eod/latest?access_key=${API_KEY}&symbols=${stockSymbol}`
      );
      
      if (!latestResponse.ok) {
        throw new Error('Failed to fetch the latest stock data');
      }
      
      const latestData = await latestResponse.json();
      
      if (!latestData.data || latestData.data.length === 0) {
        throw new Error('No data found for this symbol');
      }
      
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const historyResponse = await fetch(
        `${BASE_URL}/eod?access_key=${API_KEY}&symbols=${stockSymbol}&date_from=${thirtyDaysAgo.toISOString().split('T')[0]}&date_to=${today.toISOString().split('T')[0]}`
      );
      
      if (!historyResponse.ok) {
        throw new Error('Failed to fetch historical stock data');
      }
      
      const historyData = await historyResponse.json();
      
      if (!historyData.data || historyData.data.length === 0) {
        throw new Error('No historical data found for this symbol');
      }
      
      const sortedHistory = historyData.data.sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      setStockData(latestData.data[0]);
      setHistory(sortedHistory);
      
      generateRecommendation(sortedHistory, latestData.data[0]);
      
      updateRecentSearches(stockSymbol);
      
    } catch (err) {
      setError(err.message || 'Failed to fetch stock data');
      setStockData(null);
      setHistory([]);
      setRecommendation(null);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendation = (history, latest) => {
    if (history.length < 10) {
      setRecommendation({
        action: 'HOLD',
        confidence: 'LOW',
        reason: 'Insufficient historical data for reliable recommendation'
      });
      return;
    }

    const shortTermMA = calculateMA(history.slice(-5));
    const mediumTermMA = calculateMA(history.slice(-14));
    const longTermMA = calculateMA(history.slice(-30));
    
    const rsi = calculateRSI(history.slice(-14));
    
    const priceChange = ((latest.close - history[0].close) / history[0].close) * 100;
    
    const avgVolume = history.reduce((sum, day) => sum + day.volume, 0) / history.length;
    const volumeTrend = latest.volume > avgVolume ? 'HIGH' : 'LOW';
    
    let action = 'HOLD';
    let confidence = 'MEDIUM';
    let reason = '';
    
    if (shortTermMA > mediumTermMA && mediumTermMA > longTermMA && rsi < 70 && priceChange > 0) {
      action = 'BUY';
      reason = 'Upward trend with positive momentum and not overbought';
      
      if (rsi < 50 && volumeTrend === 'HIGH') {
        confidence = 'HIGH';
        reason += '. Potential entry point with high volume support';
      }
    }
    else if (shortTermMA < mediumTermMA && mediumTermMA < longTermMA && rsi > 30 && priceChange < 0) {
      action = 'SELL';
      reason = 'Downward trend with negative momentum and not oversold';
      
      if (rsi > 50 && volumeTrend === 'HIGH') {
        confidence = 'HIGH';
        reason += '. Strong selling pressure with high volume';
      }
    }
    else if (rsi > 70) {
      action = 'SELL';
      confidence = rsi > 80 ? 'HIGH' : 'MEDIUM';
      reason = `Stock appears overbought with RSI at ${rsi.toFixed(2)}`;
    }
    // Oversold
    else if (rsi < 30) {
      action = 'BUY';
      confidence = rsi < 20 ? 'HIGH' : 'MEDIUM';
      reason = `Stock appears oversold with RSI at ${rsi.toFixed(2)}`;
    }
    
    else {
      reason = 'Mixed signals suggest holding current position';
    }
    
    setRecommendation({ action, confidence, reason });
  };
  
  const calculateMA = (data) => {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, day) => sum + day.close, 0) / data.length;
  };

  const calculateRSI = (data) => {
    if (!data || data.length < 2) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i < data.length; i++) {
      const difference = data[i].close - data[i-1].close;
      if (difference > 0) {
        gains += difference;
      } else {
        losses -= difference;
      }
    }
    
    if (losses === 0) return 100;
    
    const relativeStrength = gains / losses;
    return 100 - (100 / (1 + relativeStrength));
  };

  const updateRecentSearches = (symbol) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== symbol);
      return [symbol, ...filtered].slice(0, 5);
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatPercent = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getActionClass = (action) => {
    if (action === 'BUY') return 'buy-action';
    if (action === 'SELL') return 'sell-action';
    return 'hold-action';
  };
  
  const getConfidenceClass = (confidence) => {
    if (confidence === 'HIGH') return 'high-confidence';
    if (confidence === 'MEDIUM') return 'medium-confidence';
    return 'low-confidence';
  };

  const getPriceChangeClass = (value) => {
    if (value > 0) return 'price-positive';
    if (value < 0) return 'price-negative';
    return 'price-neutral';
  };

  return (
    
    <div className="app-container">
      
   <img src={logoImage} alt="True Dalal Logo" className="app-logo" />
      <header className="app-header">
      <div className="logo-title-container">
    <h3 className="app-head">True Dalal</h3><br />
    <h3 className="app-title"> "<i>Always the right suggestion and choice for you</i>"</h3>
  </div>
        <p className="app-subtitle">Intelligent buy/sell recommendations powered by technical analysis</p>
      </header>

      <StockTypesInfo />

      <div className="search-container">
        <div className="search-form">
          <input
            type="text"
            placeholder="Enter stock symbol (e.g., AAPL, MSFT, TSLA)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="search-input"
          />
          <button
            onClick={() => fetchStockData(symbol)}
            disabled={loading}
            className="search-button"
          >
            {loading ? (
              <>
                <RefreshCw className="loading-icon" size={18} />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>Analyze Stock</span>
              </>
            )}
          </button>
        </div>

        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <p className="recent-searches-title">Recent searches:</p>
            <div className="recent-searches-list">
              {recentSearches.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSymbol(s);
                    fetchStockData(s);
                  }}
                  className="recent-search-btn"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}
      </div>
      
      <PopularStockCategories onSelectStock={(symbol) => {
        setSymbol(symbol);
        fetchStockData(symbol);
      }} />

      {stockData && (
        <div className="info-grid">
          <div className="card">
            <h2 className="card-title">
              <DollarSign size={18} className="inline-icon" /> 
              {stockData.symbol} Overview
            </h2>
            <div className="stock-overview">
              <div className="data-row">
                <span className="data-label">Date</span>
                <span className="data-value">{formatDate(stockData.date)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Open</span>
                <span className="data-value">{formatPrice(stockData.open)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Close</span>
                <span className="data-value">{formatPrice(stockData.close)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">High</span>
                <span className="data-value">{formatPrice(stockData.high)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Low</span>
                <span className="data-value">{formatPrice(stockData.low)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Volume</span>
                <span className="data-value">{stockData.volume.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="card recommendation-container">
            {recommendation && (
              <>
                <h2 className="card-title">
                  <Activity size={18} className="inline-icon" /> 
                  Recommendation
                </h2>
                <div className="recommendation-header">
                  <div className={`recommendation-action ${getActionClass(recommendation.action)}`}>
                    {recommendation.action === 'BUY' && <TrendingUp size={24} />}
                    {recommendation.action === 'SELL' && <TrendingDown size={24} />}
                    {recommendation.action === 'HOLD' && <BarChart2 size={24} />}
                    {recommendation.action}
                  </div>
                  <span className={`confidence-badge ${getConfidenceClass(recommendation.confidence)}`}>
                    {recommendation.confidence} CONFIDENCE
                  </span>
                </div>
                <p className="recommendation-reason">{recommendation.reason}</p>
                
                <div className="analysis-info">
                  <p className="analysis-info-title">Analysis based on:</p>
                  <ul className="analysis-info-list">
                    <li>Technical indicators from the last 30 days</li>
                    <li>Price movement patterns and volume analysis</li>
                    <li>Relative strength index (RSI) and moving averages</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="card history-card">
          <h2 className="card-title">
            <BarChart2 size={18} className="inline-icon" /> 
            Price History (Last 10 Days)
          </h2>
          <div className="table-container">
            <table className="price-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Open</th>
                  <th>Close</th>
                  <th>High</th>
                  <th>Low</th>
                  <th>Volume</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(-10).map((day, index, arr) => {
                  const prevDay = index > 0 ? arr[index - 1] : null;
                  const changePercent = prevDay 
                    ? ((day.close - prevDay.close) / prevDay.close) * 100 
                    : 0;
                  
                  return (
                    <tr key={day.date}>
                      <td>{formatDate(day.date)}</td>
                      <td>{formatPrice(day.open)}</td>
                      <td>{formatPrice(day.close)}</td>
                      <td>{formatPrice(day.high)}</td>
                      <td>{formatPrice(day.low)}</td>
                      <td>{day.volume.toLocaleString()}</td>
                      <td className={getPriceChangeClass(changePercent)}>
                        {formatPercent(changePercent)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p className="footer-disclaimer">
          Stock data provided by MarketStack API. Recommendations are based on technical analysis and should be used for informational purposes only.
        </p>
        <p>Copyright © {new Date().getFullYear()} TrueDalal</p>
      </footer>
    </div>
  );
}