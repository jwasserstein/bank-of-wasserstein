import React from 'react';
import {Provider} from 'react-redux';
import {HashRouter as Router} from 'react-router-dom';
import Main from './Main';
import {configureStore} from '../store';
import jwtdecode from 'jwt-decode';
import {LOG_IN} from '../store/actionTypes';

const store = configureStore();


// If token already exists and isn't expired, log in
if(localStorage.getItem('token')){
	const decoded = jwtdecode(localStorage.getItem('token'));
	if(Date.now()/1000 - decoded.iat < 3600){
		store.dispatch({type: LOG_IN, ...decoded});
	} else {
		localStorage.removeItem('token');
	}
}

const App = () => (
	<Provider store={store}>
		<Router>
			<div className="App">
				<Main />
			</div>
		</Router>
	</Provider>
);

export default App;
