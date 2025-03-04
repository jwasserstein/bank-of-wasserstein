import {GET_ACCOUNTS, REMOVE_ACCOUNTS, UPDATE_BALANCE, CLOSE_ACCOUNT} from '../actionTypes';

const DEFAULT_STATE = {
    accounts: []
};

export function accountReducer(state=DEFAULT_STATE, action){
    switch(action.type){
        case GET_ACCOUNTS:
            return {...state, accounts: action.accounts, lastUpdated: Date.now()}
        case REMOVE_ACCOUNTS:
            return {...state, accounts: [], lastUpdated: 0}
        case UPDATE_BALANCE:
            const accounts = state.accounts.map(a => {
                if(a._id !== action.accountId) return a;
                return {...a, accountBalance: action.accountBalance, lastUpdated: Date.now()};
            });
            return {...state, accounts};
        case CLOSE_ACCOUNT:
            const remainingAccounts = state.accounts.filter(a => a._id !== action.accountId);
            return {...state, accounts: remainingAccounts};
        default:
            return state;
    }
}