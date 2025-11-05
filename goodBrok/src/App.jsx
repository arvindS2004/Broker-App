import { useState } from 'react';
import { Search, TrendingUp, TrendingDown, RefreshCw, AlertTriangle, Activity, DollarSign, BarChart2 } from 'lucide-react';
import './App.css';
import StockTypesInfo from './components/StockTypesInfo';
import PopularStockCategories from './components/PopularStockCategories';
import logoImage from './assets/logot.png';

const BASE_URL = "https://broker-app-backend.onrender.com/api"; 

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

      // Single call to your backend
      const response = await fetch(`${BASE_URL}/stocks?symbols=${stockSymbol}`);
      if (!response.ok) throw new Error('Failed to fetch stock data');

      const data = await response.json();

      if (!data || !data.eodData || data.eodData.length === 0) {
        throw new Error('No data found for this symbol');
      }

      // Extract from backend structure
      const tickerData = data.tickerData?.[0] || {};
      const eodData = data.eodData || [];

      const sortedHistory = eodData.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      setStockData({
        symbol: tickerData.symbol || stockSymbol,
        date: sortedHistory[sortedHistory.length - 1].date,
        open: sortedHistory[sortedHistory.length - 1].open,
        close: sortedHistory[sortedHistory.length - 1].close,
        high: sortedHistory[sortedHistory.length - 1].high,
        low: sortedHistory[sortedHistory.length - 1].low,
        volume: sortedHistory[sortedHistory.length - 1].volume,
      });

      setHistory(sortedHistory);

      generateRecommendation(sortedHistory, sortedHistory[sortedHistory.length - 1]);
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
    } else if (shortTermMA < mediumTermMA && mediumTermMA < longTermMA && rsi > 30 && priceChange < 0) {
      action = 'SELL';
      reason = 'Downward trend with negative momentum and not oversold';
      if (rsi > 50 && volumeTrend === 'HIGH') {
        confidence = 'HIGH';
        reason += '. Strong selling pressure with high volume';
      }
    } else if (rsi > 70) {
      action = 'SELL';
      confidence = rsi > 80 ? 'HIGH' : 'MEDIUM';
      reason = `Stock appears overbought with RSI at ${rsi.toFixed(2)}`;
    } else if (rsi < 30) {
      action = 'BUY';
      confidence = rsi < 20 ? 'HIGH' : 'MEDIUM';
      reason = `Stock appears oversold with RSI at ${rsi.toFixed(2)}`;
    } else {
      reason = 'Mixed signals suggest holding current position';
    }

    setRecommendation({ action, confidence, reason });
  };

  const calculateMA = (data) =>
    data.reduce((sum, day) => sum + day.close, 0) / data.length || 0;

  const calculateRSI = (data) => {
    if (data.length < 2) return 50;
    let gains = 0, losses = 0;
    for (let i = 1; i < data.length; i++) {
      const diff = data[i].close - data[i - 1].close;
      if (diff > 0) gains += diff; else losses -= diff;
    }
    if (losses === 0) return 100;
    const rs = gains / losses;
    return 100 - (100 / (1 + rs));
  };

  const updateRecentSearches = (symbol) => {
    setRecentSearches(prev => [symbol, ...prev.filter(s => s !== symbol)].slice(0, 5));
  };

  const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const formatPrice = (p) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p);
  const formatPercent = (v) => `${v > 0 ? '+' : ''}${v.toFixed(2)}%`;
  const getActionClass = (a) => a === 'BUY' ? 'buy-action' : a === 'SELL' ? 'sell-action' : 'hold-action';
  const getConfidenceClass = (c) => c === 'HIGH' ? 'high-confidence' : c === 'MEDIUM' ? 'medium-confidence' : 'low-confidence';
  const getPriceChangeClass = (v) => v > 0 ? 'price-positive' : v < 0 ? 'price-negative' : 'price-neutral';

  return (
    <div className="app-container">
      <img src={logoImage} alt="True Dalal Logo" className="app-logo" />
      <header className="app-header">
        <div className="logo-title-container">
          <h3 className="app-head">True Dalal</h3><br />
          <h3 className="app-title">"<i>Always the right suggestion and choice for you</i>"</h3>
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
          <button onClick={() => fetchStockData(symbol)} disabled={loading} className="search-button">
            {loading ? (<><RefreshCw className="loading-icon" size={18} /><span>Loading...</span></>) : (<><Search size={18} /><span>Analyze Stock</span></>)}
          </button>
        </div>

        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <p className="recent-searches-title">Recent searches:</p>
            <div className="recent-searches-list">
              {recentSearches.map((s) => (
                <button key={s} onClick={() => { setSymbol(s); fetchStockData(s); }} className="recent-search-btn">{s}</button>
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

      <PopularStockCategories onSelectStock={(s) => { setSymbol(s); fetchStockData(s); }} />

      {stockData && (
        <div className="info-grid">
          <div className="card">
            <h2 className="card-title"><DollarSign size={18} className="inline-icon" /> {stockData.symbol} Overview</h2>
            <div className="stock-overview">
              {['date', 'open', 'close', 'high', 'low', 'volume'].map((key) => (
                <div key={key} className="data-row">
                  <span className="data-label">{key[0].toUpperCase() + key.slice(1)}</span>
                  <span className="data-value">
                    {key === 'date' ? formatDate(stockData[key]) :
                      key === 'volume' ? stockData[key].toLocaleString() : formatPrice(stockData[key])}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card recommendation-container">
            {recommendation && (
              <>
                <h2 className="card-title"><Activity size={18} className="inline-icon" /> Recommendation</h2>
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
              </>
            )}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="card history-card">
          <h2 className="card-title"><BarChart2 size={18} className="inline-icon" /> Price History (Last 10 Days)</h2>
          <div className="table-container">
            <table className="price-table">
              <thead><tr><th>Date</th><th>Open</th><th>Close</th><th>High</th><th>Low</th><th>Volume</th><th>Change</th></tr></thead>
              <tbody>
                {history.slice(-10).map((day, i, arr) => {
                  const prev = i > 0 ? arr[i - 1] : null;
                  const change = prev ? ((day.close - prev.close) / prev.close) * 100 : 0;
                  return (
                    <tr key={day.date}>
                      <td>{formatDate(day.date)}</td>
                      <td>{formatPrice(day.open)}</td>
                      <td>{formatPrice(day.close)}</td>
                      <td>{formatPrice(day.high)}</td>
                      <td>{formatPrice(day.low)}</td>
                      <td>{day.volume.toLocaleString()}</td>
                      <td className={getPriceChangeClass(change)}>{formatPercent(change)}</td>
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
          Stock data provided by MarketStack API through our backend. Recommendations are based on technical analysis and should be used for informational purposes only.
        </p>
        <p>Copyright © {new Date().getFullYear()} TrueDalal</p>
      </footer>
    </div>
  );
}
