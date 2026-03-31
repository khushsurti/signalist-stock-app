export const priceAlertEmailTemplate = (
  symbol: string,
  company: string,
  currentPrice: number,
  targetPrice: number,
  condition: 'above' | 'below'
) => {
  const isAbove = condition === 'above';
  const emoji = isAbove ? '🚀' : '📉';
  const action = isAbove ? 'crossed above' : 'dropped below';
  const color = isAbove ? 'green' : 'red';
  const priceChange = isAbove 
    ? `+${((currentPrice - targetPrice) / targetPrice * 100).toFixed(2)}%`
    : `-${((targetPrice - currentPrice) / targetPrice * 100).toFixed(2)}%`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Stock Price Alert - ${symbol}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 28px;
        }
        .header p {
          color: rgba(255,255,255,0.9);
          margin: 10px 0 0;
          font-size: 14px;
        }
        .content {
          padding: 30px;
        }
        .price-card {
          background: linear-gradient(135deg, ${color === 'green' ? '#00b09b' : '#ff6b6b'}, ${color === 'green' ? '#96c93d' : '#ee5a5a'});
          border-radius: 16px;
          padding: 25px;
          text-align: center;
          color: white;
          margin: 20px 0;
        }
        .price-card .symbol {
          font-size: 20px;
          font-weight: 500;
          opacity: 0.9;
        }
        .price-card .price {
          font-size: 48px;
          font-weight: bold;
          margin: 15px 0;
        }
        .price-card .change {
          font-size: 16px;
          opacity: 0.9;
        }
        .details {
          background-color: #f8f9fa;
          border-radius: 16px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 500;
          color: #6c757d;
        }
        .detail-value {
          font-weight: 600;
          color: #212529;
        }
        .button {
          display: inline-block;
          background-color: #2a5298;
          color: white;
          text-decoration: none;
          padding: 12px 28px;
          border-radius: 10px;
          margin-top: 20px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .button:hover {
          background-color: #1e3c72;
          transform: translateY(-2px);
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #6c757d;
          font-size: 12px;
        }
        .emoji {
          font-size: 48px;
          text-align: center;
          margin: 20px 0;
        }
        .alert-badge {
          display: inline-block;
          background: ${color === 'green' ? '#28a745' : '#dc3545'};
          color: white;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${emoji} Stock Price Alert ${emoji}</h1>
          <p>Signalist - Your Personal Stock Assistant</p>
        </div>
        <div class="content">
          <div class="price-card">
            <div class="symbol">${symbol} • ${company}</div>
            <div class="price">$${currentPrice.toFixed(2)}</div>
            <div class="change">${action} your target of $${targetPrice.toFixed(2)} (${priceChange})</div>
          </div>

          <div class="details">
            <div class="detail-row">
              <span class="detail-label">📊 Stock Symbol</span>
              <span class="detail-value">${symbol}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🏢 Company</span>
              <span class="detail-value">${company}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🎯 Target Price</span>
              <span class="detail-value">$${targetPrice.toFixed(2)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">💰 Current Price</span>
              <span class="detail-value" style="color: ${color}; font-weight: bold;">$${currentPrice.toFixed(2)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📈 Condition</span>
              <span class="detail-value">Price ${condition} $${targetPrice.toFixed(2)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">⏰ Alert Time</span>
              <span class="detail-value">${new Date().toLocaleString()}</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/stocks/${symbol}" class="button">
              🔍 View ${symbol} Details →
            </a>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated alert from Signalist Stock Market App.</p>
          <p>You received this because you set a price alert for ${symbol}.</p>
          <p>To manage your alerts, visit your <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/alerts" style="color: #2a5298;">Alerts Dashboard</a>.</p>
          <p style="margin-top: 10px; font-size: 11px;">© ${new Date().getFullYear()} Signalist. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email for successful alert creation
export const alertCreatedTemplate = (
  symbol: string,
  company: string,
  targetPrice: number,
  condition: 'above' | 'below'
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Alert Created - ${symbol}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; text-align: center; }
        .check { width: 60px; height: 60px; background: #28a745; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 30px; margin-bottom: 20px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Alert Created Successfully</h1>
        </div>
        <div class="content">
          <div class="check">✓</div>
          <h2>${symbol} - ${company}</h2>
          <p>You will be notified when price goes <strong>${condition} $${targetPrice}</strong></p>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">We'll send you an email when this condition is met.</p>
        </div>
        <div class="footer">
          <p>Signalist Stock Market App</p>
        </div>
      </div>
    </body>
    </html>
  `;
};