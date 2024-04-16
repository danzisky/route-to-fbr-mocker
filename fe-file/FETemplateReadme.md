ROADMAP - DN

Use the [**ServerMocker**](https://github.com/danzisky/route-to-fbr-mocker), to receive the responses from the shefa backend-url as requests, and save them in a file-based-routing format.
Remember to change the port in the **mock-server.js** file. Default is `8020` on localhost

Use response interceptors on the axios instance to send BE responses to the ServerMocker for persisting, depending on if the env variable permitting templating is enabled `APP_USE_MOCK_API = true`

Copy the generated file routes folder on the server at **mock_api/routes** to the client **src/mock_api/routes**.

Use axios request interceptors to return data from the src/mock_api/routes when `APP_READ_MOCK_API = true`

Example:
```javascript
axios.interceptors.request.use(async (config) => {
   // Check if APP_READ_MOCK_API is true from environment variables
  if (process.env.APP_READ_MOCK_API === "true") {
    const savedResponse = await getMockResponse(config.url, config.method, config.params, false);
    if (savedResponse?.status) {
      // Reject the request and return the saved response
      return Promise.reject({
        mockResponse: savedResponse,
        is_mock: true,
      })
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

axios.interceptors.response.use(async (response) => {
  // Check if APP_USE_MOCK_API is true from environment variables
  if (process.env.APP_USE_MOCK_API === "true") {
    // Save mock response to json file on server
    await saveMockResponse(response.config.url, response.config.method, response.config.params, response.data);
  }

  return response;
}, async (error) => {
  // check if error is a cancelation due to mock response
  if (error?.is_mock) {
    const config = error.config;
    if (process.env.APP_READ_MOCK_API === "true") {
      const savedResponse = error.mockResponse;
      if (savedResponse) {
        return savedResponse; // Return saved response if it exists
      }
    }
  }
})
```