interface ResponseOptions {
  headers?: {
    [key: string]: string
  },
}

export default (response, status: number = 200, options?: ResponseOptions) => {
  if (status === 200) {
    return (
      {
        statusCode: 200,
        body: JSON.stringify(response),
        headers: options?.headers,
      }
    );
  }
};
