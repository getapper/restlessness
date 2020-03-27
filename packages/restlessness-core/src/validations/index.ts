type YupShapeByInterface<T> = {
  [K in keyof T]: any;
}

export {
  YupShapeByInterface,
};
