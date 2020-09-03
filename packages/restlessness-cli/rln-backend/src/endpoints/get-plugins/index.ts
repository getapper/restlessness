import 'module-alias/register';
import LambdaHandler from '../../services/LambdaHandler';
import handler from './handler';
import validations from './validations';

export default LambdaHandler.bind(this, handler, validations, 'getPlugins');
