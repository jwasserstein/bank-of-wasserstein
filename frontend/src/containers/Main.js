import {Route, Switch} from 'react-router-dom';
import LoginPage from './LoginPage';
import TransactionPage from './TransactionPage';
import withAuth from '../hocs/withAuth';
import SignupPage from './SignupPage';
import NewTransactionPage from './NewTransactionPage';
import LandingPage from '../components/LandingPage';
import AboutPage from '../components/AboutPage';
import ProfilePage from './ProfilePage';
import AccountsPage from './AccountsPage';
import NewAccountPage from './NewAccountPage';
import Navbar from './Navbar';

const Main = () => (
	<div>
		<Navbar />
		<Switch>
			<Route path='/accounts/new' component={withAuth(NewAccountPage)} />
			<Route path='/accounts/:accountId/transactions/new' component={withAuth(NewTransactionPage)} />
			<Route path='/accounts/:accountId' component={withAuth(TransactionPage)} />
			<Route path='/accounts' component={withAuth(AccountsPage)} />
			<Route path='/profile' component={withAuth(ProfilePage)} />
			<Route path='/about' component={AboutPage} />
			<Route path='/signup' component={SignupPage} />
			<Route path='/login' component={LoginPage} />
			<Route path='/' component={LandingPage} />
		</Switch>
	</div>
);

export default Main;