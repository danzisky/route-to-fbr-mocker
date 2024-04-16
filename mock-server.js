const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8020;

// Enable CORS
app.use(cors());
// Middleware to parse JSON bodies
app.use(bodyParser.json());

const baseMockPath = 'mock_api/routes';

function getMockPath(route, method = 'GET') {
  return path.join(__dirname, baseMockPath, route, method + '.json');
}
app.get('/', (req, res) => {
  res.send(`
    <h1>Mock Server</h1>
  `);
});
app.post('/save-mock-data', (req, res) => {
  const { route, method, params, response } = req.body;

  if (!route) {
    return res.status(400).send('Route is required');
  }

  // // remove any query params from the route string
  // const routeParts = route.split('?');
  // route = routeParts[0];

  const mockPath = getMockPath(route, method);
  const paramsStr = params ? `_${JSON.stringify(params)}` : '_';

  const responseData = {
    [paramsStr]: response,
    default: response,
  };

  try {
    fs.mkdirSync(path.dirname(mockPath), { recursive: true });
    fs.writeFileSync(mockPath, JSON.stringify(responseData, null, 2));
    res.status(200).send('Mock data saved successfully.');
  } catch (error) {
    console.error('Error saving mock data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Mock server listening on port ${PORT}`);
});
