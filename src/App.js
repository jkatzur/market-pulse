import { useState, useEffect } from 'react';
import './App.css';
import { getMarketData, getIntradayData } from './services/marketData';
import { getMarketNews } from './services/newsService';
import { analyzeMarketNews, findSupportingQuotes } from './services/llmService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

function App() {
  const [marketStatus, setMarketStatus] = useState({
    direction: "flat",
    explanation: "Loading market data...",
    analysis: "",
    supportingQuotes: "",
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

  const [newsData, setNewsData] = useState([]);

  const fetchAllData = async () => {
    try {
      // Fetch market data
      const data = await getMarketData();
      
      // Fetch intraday data for all indices
      const [sp500Chart, nasdaqChart, dowChart] = await Promise.all([
        getIntradayData('sp500'),
        getIntradayData('nasdaq'),
        getIntradayData('dow')
      ]);

      // Add news fetch
      const news = await getMarketNews();
      setNewsData(news);

      // Determine overall market direction based on S&P 500
      const direction = data.sp500.percentChange > 0.1 
        ? "up" 
        : data.sp500.percentChange < -0.1 
        ? "down" 
        : "flat";

      // Get LLM analysis
      const analysis = await analyzeMarketNews(news, direction);
      const quotes = await findSupportingQuotes(news, analysis);

      setMarketStatus(prevState => ({
        ...prevState,
        direction,
        explanation: analysis,
        supportingQuotes: quotes,
        timestamp: new Date().toLocaleString(),
        indices: {
          sp500: {
            ...prevState.indices.sp500,
            currentLevel: data.sp500.currentPrice.toLocaleString(),
            percentageChange: `${data.sp500.percentChange >= 0 ? '+' : ''}${data.sp500.percentChange}%`,
            dayData: sp500Chart
          },
          nasdaq: {
            ...prevState.indices.nasdaq,
            currentLevel: data.nasdaq.currentPrice.toLocaleString(),
            percentageChange: `${data.nasdaq.percentChange >= 0 ? '+' : ''}${data.nasdaq.percentChange}%`,
            dayData: nasdaqChart
          },
          dow: {
            ...prevState.indices.dow,
            currentLevel: data.dow.currentPrice.toLocaleString(),
            percentageChange: `${data.dow.percentChange >= 0 ? '+' : ''}${data.dow.percentChange}%`,
            dayData: dowChart
          }
        }
      }));
    } catch (error) {
      console.error('Error updating data:', error);
      setMarketStatus(prevState => ({
        ...prevState,
        explanation: "Error analyzing market data. Please try again later."
      }));
    }
  };

  useEffect(() => {
    // Fetch initial data
    fetchAllData();

    // Set up polling every minute
    const intervalId = setInterval(fetchAllData, 60000);

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

  const getChartOptions = (indexName) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (context) => {
            return new Date(context[0].raw.x).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            });
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM d'
          },
          tooltipFormat: 'PPP',
          round: 'day'
        },
        grid: {
          display: false
        },
        ticks: {
          source: 'data',
          autoSkip: true,
          maxRotation: 0,
          align: 'center'
        },
        bounds: 'data'
      },
      y: {
        grid: {
          color: '#e0e0e0'
        },
        ticks: {
          callback: (value) => value.toLocaleString()
        }
      }
    }
  });

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
        {marketStatus.supportingQuotes && (
          <div className="supporting-quotes">
            <h3>Supporting Evidence:</h3>
            <p>{marketStatus.supportingQuotes}</p>
          </div>
        )}
        <small>Last updated: {marketStatus.timestamp}</small>
      </section>

      <section className="market-charts">
        <div className="chart-grid">
          {Object.entries(marketStatus.indices).map(([key, index]) => (
            <div key={key} className="chart-container">
              <h2>{index.name}</h2>
              <div className="chart-area">
                {index.dayData?.length > 0 ? (
                  <Line
                    data={{
                      datasets: [{
                        data: index.dayData,
                        borderColor: index.percentageChange.startsWith('+') 
                          ? 'var(--up-color)' 
                          : 'var(--down-color)',
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.1
                      }]
                    }}
                    options={getChartOptions(index.name)}
                  />
                ) : (
                  <div className="chart-placeholder">
                    Loading chart data...
                  </div>
                )}
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

      <section className="market-news">
        <h2>Latest Market News</h2>
        <div className="news-list">
          {newsData.map((article, index) => (
            <div key={index} className="news-item">
              <h3>{article.title}</h3>
              <p className="news-meta">
                {article.provider} • {new Date(article.datePublished).toLocaleString()}
              </p>
              <p>{article.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
