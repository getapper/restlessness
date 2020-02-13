const requestParser = event => ({
  payload: JSON.parse(event.body),
  pathParameters: event.pathParameters,
  queryStringParameters: event.queryStringParameters,
});

export default requestParser;
