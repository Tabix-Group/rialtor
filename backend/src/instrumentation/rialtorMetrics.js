const fs = require('fs');
const path = require('path');

const metricsFile = path.join(__dirname, '..', '..', 'logs', 'rialtor_metrics.log');

if (!fs.existsSync(path.dirname(metricsFile))) {
  fs.mkdirSync(path.dirname(metricsFile), { recursive: true });
}

const log = (entry) => {
  const line = JSON.stringify(Object.assign({ ts: new Date().toISOString() }, entry));
  fs.appendFile(metricsFile, line + '\n', (err) => {
    if (err) console.error('Failed to write metrics:', err);
  });
};

const record = ({ source_used, tool_used, latency_ms, tokens_out, fallback_reason }) => {
  log({ source_used, tool_used, latency_ms, tokens_out, fallback_reason });
};

module.exports = { record };
