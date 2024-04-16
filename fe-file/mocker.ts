const mockServer = 'http://localhost:8020'; // 'http://localhost:8020' is the default mock server url

function getMockPath(route: string, method = 'GET') {
  // remove trailing slash
  route = route.replace(/\/$/, '');
  // remove leading slash
  route = route.replace(/^\//, '');
  method = method.toLowerCase();
  return `${route}/${method}.json`;
}

function parseRoutePath(route: any, params: object = {}) {
  if (!route) {
    return { route, params };
  }

  // remove backend ai url found in .env file
  route = route.replace(process.env.VUE_APP_API_URL, '');

  // remove keycloak url found in .env file
  route = route.replace(process.env.VUE_APP_KEYCLOAK_URL, '');

  
  // remove any query params from the route string
  const routeParts = route.split('?');
  route = routeParts[0];

  // add the query params to the params object
  if (routeParts.length > 1) {
    const queryParams = routeParts[1].split('&');
    queryParams.forEach((param: any) => {
      const [key, value] = param.split('=');
      params = { ...params, [key]: value };
    });
  }

  return { route, params };

}
export const saveMockResponse = async (route: any, method = 'GET', params?: object, response?: object) => {
  if (!route) {
    return;
  }

  const { route: newRoute, params: newParams} = parseRoutePath(route, params);
  route = newRoute;
  params = newParams;

  try {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ route, method, params, response }),
    };

    const res = await fetch(mockServer+'/save-mock-data', requestOptions);
    if (!res.ok) {
      throw new Error('Failed to save mock data');
    }

    console.log('Mock data saved successfully.');
  } catch (error) {
    console.error('Error saving mock data:', error);
    // Handle error as needed
  }
};

export const getMockResponse = async (route?: string, method = 'GET', params? :object, useDefault = false) => {
  if (!route) {
    console.log('No route provided for mock data');
    return;
  } else {
    // console.log('Route provided for mock data', route); // debug
  }

  const { route: newRoute, params: newParams} = parseRoutePath(route, params);
  const routePath = newRoute;
  params = newParams;

  const mockPath = getMockPath(routePath, method);
  
  const paramsStr = params ? `_${JSON.stringify(params)}` : '_';

  try {
    const responseData = await require(`./routes/${mockPath}`);

    // console.log({resX: responseData}); // debug

    return useDefault ? responseData.default : (responseData[paramsStr] ?? responseData.default ?? {});
  } catch (error) {
    console.error('Error fetching mock data:', error);
    // Handle error as needed
    return {};
  }
};
