import {GET_TRANSACTIONS, UPDATE_BALANCE} from '../actionTypes';
import {apiCall} from '../../services/api';

export function getTransactions(accountId){
	return dispatch => {
		return new Promise(async (resolve, reject) => {
			try {
				const resp = await apiCall('get', `/accounts/${accountId}/transactions/`, {});
				if(resp.error){
					return reject(new Error(resp.error));
				}
				const transactions = resp.sort((a, b) => b.transactionNumber - a.transactionNumber);
				dispatch({
					type: GET_TRANSACTIONS,
					accountId,
					transactions
				});
				return resolve();
			} catch(err) {
				return reject(err);
			}
		});
	};
}

export function generateTransactions(num, accountId){
	return dispatch => {
		return new Promise(async (resolve, reject) => {
			try {
				const resp = await apiCall('post', `/accounts/${accountId}/transactions/generate/${num}`, {});
				
				if(resp.error) {
					return reject(new Error(resp.error));
				}
				
				const transactions = resp.sort((a, b) => b.transactionNumber - a.transactionNumber);
				dispatch({
					type: GET_TRANSACTIONS,
					accountId,
					transactions
				});
				dispatch({
					type: UPDATE_BALANCE,
					accountId,
					accountBalance: transactions[0].accountBalance
				});
				
				return resolve();
			} catch(err) {
				return reject(err);
			}
		});
	}
}

export function createTransaction(transaction, accountId){
	return dispatch => {
		return new Promise(async (resolve, reject) => {
			try {
				const resp = await apiCall('post', `/accounts/${accountId}/transactions/`, transaction);
				
				if(resp.error){
					return reject(new Error(resp.error));
				}
				
				const transactions = resp.sort((a, b) => b.transactionNumber - a.transactionNumber);
				dispatch({
					type: GET_TRANSACTIONS,
					accountId,
					transactions
				});
				dispatch({
					type: UPDATE_BALANCE,
					accountId,
					accountBalance: transactions[0].accountBalance
				});

				return resolve();
			} catch(err){
				return reject(err);
			}
		});
	}
}