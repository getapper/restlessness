interface ResponseOptions {
  headers?: {
    [key: string]: string
  },
}

export default (response, statusCode: number = 200, options?: ResponseOptions) => {
  return (
    {
      statusCode,
      body: JSON.stringify(response),
      headers: options?.headers,
    }
  );
};
