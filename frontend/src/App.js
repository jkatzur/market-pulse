import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { getMarketData, getIntradayData, getMarketNews, analyzeMarketNews } from './services/api';
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
import { processFootnotes } from './utils/textProcessing';

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

  const fetchMarketData = useCallback(async () => {
    try {
      const data = await getMarketData();
      
      const [sp500Chart, nasdaqChart, dowChart] = await Promise.all([
        getIntradayData('sp500'),
        getIntradayData('nasdaq'),
        getIntradayData('dow')
      ]);

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
      console.error('Error updating market data:', error);
    }
  }, []);

  const fetchNewsAndAnalysis = useCallback(async () => {
    try {
      const news = await getMarketNews();
      setNewsData(news);

      if (news && news.length > 0) {
        const analysis = await analyzeMarketNews(news, marketStatus.direction);
        setMarketStatus(prevState => ({
          ...prevState,
          explanation: analysis
        }));
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setMarketStatus(prevState => ({
        ...prevState,
        explanation: "Error analyzing market data. Please try again later."
      }));
    }
  }, [marketStatus.direction]);

  useEffect(() => {
    // Initial fetch of both market data and news
    const initializeData = async () => {
      await fetchMarketData();
      await fetchNewsAndAnalysis();
    };
    initializeData();
  }, [fetchMarketData, fetchNewsAndAnalysis]);

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

  const getChartOptions = (indexName, chartData) => ({
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
        type: 'category',
        grid: {
          display: false
        },
        ticks: {
          autoSkip: true,
          maxRotation: 0,
          callback: (_, index) => {
            const point = chartData[index];
            if (!point) return '';
            return new Date(point.x).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });
          }
        },
      },
      y: {
        grid: {
          color: '#e0e0e0'
        },
        ticks: {
          callback: (value, index, values) => {
            if (index === 0 || index === values.length - 1) return '';
            return value.toLocaleString();
          }
        },
        min: (scale) => {
          const min = Math.min(...chartData.map(point => point.y));
          const range = Math.abs(min * 0.02); // 2% of min value
          return min - range;
        },
        max: (scale) => {
          const max = Math.max(...chartData.map(point => point.y));
          const range = Math.abs(max * 0.02); // 2% of max value
          return max + range;
        }
      }
    }
  });

  const processChartData = (data) => {
    if (!data || !data.quotes) return null;
    
    // Sort quotes by timestamp first
    const sortedQuotes = [...data.quotes].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Get the last 5 points regardless of gaps
    const lastFiveQuotes = sortedQuotes.slice(-5);
    
    // Create evenly spaced data points
    const chartData = lastFiveQuotes.map((quote, index) => ({
      x: new Date(quote.timestamp),
      y: parseFloat(quote.price),
      index: index
    }));
    return chartData;
  };

  const processIntradayData = (data) => {
    if (!data || !data.quotes) return null;
    
    const chartData = data.quotes.map(quote => ({
      x: new Date(quote.timestamp),
      y: parseFloat(quote.price)
    }));
    return chartData;
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
        <p dangerouslySetInnerHTML={{ 
          __html: processFootnotes(marketStatus.explanation) 
        }} />
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
                    options={getChartOptions(key, index.dayData)}
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

      <section id="market-news" className="market-news">
        <h2>Latest Market News</h2>
        <div className="news-list">
          {newsData.map((article, index) => (
            <div key={index} className="news-item" id={`footnote-${index + 1}`}>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="news-link"
              >
                <h3>
                  <span className="footnote-number">{index + 1}.</span>
                  {article.title}
                </h3>
                <p className="news-meta">
                  {article.provider} • {new Date(article.datePublished).toLocaleString()}
                </p>
                <p>{article.description}</p>
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
