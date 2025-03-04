import {GET_TRANSACTIONS, REMOVE_TRANSACTIONS} from '../actionTypes';

const DEFAULT_STATE = {};

export function transactionReducer(state=DEFAULT_STATE, action){
	switch(action.type){
		case GET_TRANSACTIONS:
			return {...state, [action.accountId]: {transactions: action.transactions, lastUpdated: Date.now()}};
		case REMOVE_TRANSACTIONS:
			return {};
		default:
			return state;
	}
}