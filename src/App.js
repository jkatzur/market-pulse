import { useState, useEffect } from 'react';
import './App.css';
import { getMarketData } from './services/marketData';

function App() {
  const [marketStatus, setMarketStatus] = useState({
    direction: "flat",
    explanation: "Loading market data...",
    timestamp: new Date().toLocaleString(),
    indices: {
      sp500: {
        name: "S&P 500",
        currentLevel: "Loading...",
        percentageChange: "0.00%",
        dayData: []
      },
      nasdaq: {
        name: "NASDAQ",
        currentLevel: "Loading...",
        percentageChange: "0.00%",
        dayData: []
      },
      dow: {
        name: "Dow Jones",
        currentLevel: "Loading...",
        percentageChange: "0.00%",
        dayData: []
      }
    }
  });

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await getMarketData();
        
        // Determine overall market direction based on S&P 500
        const direction = data.sp500.percentChange > 0.1 
          ? "up" 
          : data.sp500.percentChange < -0.1 
          ? "down" 
          : "flat";

        setMarketStatus(prevState => ({
          ...prevState,
          direction,
          timestamp: new Date().toLocaleString(),
          indices: {
            sp500: {
              ...prevState.indices.sp500,
              currentLevel: data.sp500.currentPrice.toLocaleString(),
              percentageChange: `${data.sp500.percentChange >= 0 ? '+' : ''}${data.sp500.percentChange}%`
            },
            nasdaq: {
              ...prevState.indices.nasdaq,
              currentLevel: data.nasdaq.currentPrice.toLocaleString(),
              percentageChange: `${data.nasdaq.percentChange >= 0 ? '+' : ''}${data.nasdaq.percentChange}%`
            },
            dow: {
              ...prevState.indices.dow,
              currentLevel: data.dow.currentPrice.toLocaleString(),
              percentageChange: `${data.dow.percentChange >= 0 ? '+' : ''}${data.dow.percentChange}%`
            }
          }
        }));
      } catch (error) {
        console.error('Error updating market data:', error);
      }
    };

    // Fetch initial data
    fetchMarketData();

    // Set up polling every minute
    const intervalId = setInterval(fetchMarketData, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const getBorderColor = (direction) => {
    switch(direction) {
      case 'up':
        return 'var(--up-color)';
      case 'down':
        return 'var(--down-color)';
      case 'flat':
        return 'var(--flat-color)';
      default:
        return 'var(--border-color)';
    }
  };

  return (
    <div className="App">
      <header className="market-header">
        <h1>
          Why are stocks{' '}
          <span className={`direction-indicator direction-${marketStatus.direction}`}>
            {marketStatus.direction}
          </span>
          {' '}today?
        </h1>
      </header>
      
      <section 
        className="market-explanation"
        style={{ borderLeftColor: getBorderColor(marketStatus.direction) }}
      >
        <p>{marketStatus.explanation}</p>
        <small>Last updated: {marketStatus.timestamp}</small>
      </section>

      <section className="market-charts">
        <div className="chart-grid">
          {Object.entries(marketStatus.indices).map(([key, index]) => (
            <div key={key} className="chart-container">
              <h2>{index.name}</h2>
              <div className="chart-placeholder">
                [Chart Will Go Here]
              </div>
              <div className="chart-details">
                <span className="current-level">{index.currentLevel}</span>
                <span className={`percentage-change ${index.percentageChange.startsWith('+') ? 'positive' : 'negative'}`}>
                  {index.percentageChange}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
