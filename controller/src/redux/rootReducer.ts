// import { counterReducer } from './counter/slice';
import { authReducer } from './auth/slice';
import { apiReducer } from './api/slice';

const rootReducer = {
  // counter: counterReducer,
  auth: authReducer,
  api: apiReducer,
};

export default rootReducer;
