import 'module-alias/register';
import { LambdaHandler } from '@restlessness/core';
import handler from './handler';
import validations from './validations';

export default LambdaHandler.bind(this, handler, validations, 'getEnvs');
