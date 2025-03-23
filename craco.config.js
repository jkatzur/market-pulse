import querystring from 'querystring-es3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "querystring": path.resolve(__dirname, 'node_modules/querystring-es3')
        }
      }
    }
  }
}; 