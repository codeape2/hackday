import * as React from 'react';
import './app.css';

import logo from './logo.png';

class App extends React.Component {
  public render() {
    return (
      <div className="app">
        <img className="app-logo" src={logo} alt="logo" />
        <p>RoverFront</p>
        <button onClick={() => alert("Robot!")}>Test</button>
      </div>
    );
  }
}

export default App;
