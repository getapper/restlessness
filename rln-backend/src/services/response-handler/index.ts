interface ResponseOptions {
  headers?: {
    [key: string]: string
  },
}

export default (cb: Function, response, status: number = 200, options?: ResponseOptions) => {
  if (status === 200) {
    return cb(null,
      {
        statusCode: 200,
        body: JSON.stringify(response),
        headers: options?.headers,
      }
    );
  }
};
