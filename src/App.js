import './App.css';

function App() {
  // Mock data
  const marketStatus = {
    direction: "up", // could be "up", "down", or "flat"
    explanation: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    timestamp: "2024-03-19 16:00 EST",
    indices: {
      sp500: {
        name: "S&P 500",
        currentLevel: "5,149.42",
        percentageChange: "+1.12%",
        dayData: [/* We'll add mock chart data later */]
      },
      nasdaq: {
        name: "NASDAQ",
        currentLevel: "16,166.79",
        percentageChange: "+1.54%",
        dayData: [/* We'll add mock chart data later */]
      },
      dow: {
        name: "Dow Jones",
        currentLevel: "38,791.35",
        percentageChange: "+0.83%",
        dayData: [/* We'll add mock chart data later */]
      }
    }
  };

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
