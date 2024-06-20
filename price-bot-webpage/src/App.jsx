import './App.css';
import { BrowserRouter as Router, Route ,Link, Routes} from "react-router-dom";
// import Root from './routes/root'
import Home from './routes/home'
import NotificationTable from './components/notificationtable';

export default function App() {
  return (
    <Router>
        <div>
        <nav>
          {/* <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/users">Users</Link>
            </li>
          </ul> */}
          <ul>
          <li><Link to="/">Home</Link></li>
          {/* <li><Link to="/about">About</Link></li> */}
          <li><Link to="/user">User</Link></li>
          </ul>
        </nav>
        </div>

        {/* A <Routes> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Routes>
          {/* <Route path="/about" element={<About/>}>
          </Route> */}
          <Route path="/user/:userid/:channelid" element={<NotificationTable/>}>;
          </Route>
          <Route path="/" element={<Home/>}>
          </Route>
          {/* <Route path="/root" element={<Root/>}>
          </Route>  */}
        </Routes>
    </Router>
  );
}
