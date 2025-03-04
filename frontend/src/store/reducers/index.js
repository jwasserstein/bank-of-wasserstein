import {combineReducers} from 'redux';
import {authReducer} from './auth';
import {transactionReducer} from './transactions';
import {accountReducer} from './account';

const rootReducer = combineReducers({
	authReducer,
	transactionReducer,
	accountReducer
});

export default rootReducer;