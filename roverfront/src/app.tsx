
import * as React from 'react';
import './app.css';

import logo from './logo.png';
import RoverEditor from './components/roverEditor';
import { compileTs } from './modules/tsCompiler';
import * as connections from './modules/connections';
import { roverSettings } from './modules/globals';
import Rover from 'src/modules/rover';
import { IRover } from './rover';

class App extends React.Component {

  private rover: Rover;

  constructor(props: any) {
    super(props);
    this.rover = new Rover();
  }

  public componentDidMount() {
    const host = window.location.host; // TODO - Inject. Won't work on dev server.

    /*
    const rover = new connections.Rover(roverSettings.host);
    const firehose = new connections.Firehose(roverSettings.host);
    const range = new connections.RangeFinder(roverSettings.host);
    */
  }

  private editor: RoverEditor | null;

  private runCode = async () => {
    if (!this.editor) {
      return;
    }

    // Compile to javascript.
    const tsCode = this.editor.currentCode;
    const jsCode = compileTs(tsCode);

    const instance = eval(jsCode) as (rover: IRover) => Promise<any>;
    if (typeof instance === "function") {
      instance(this.rover);
    }
  };


  public render() {
    const startCode =
      `
async (rover: IRover) => {
  // Your code here
  await rover.forward();
  await rover.wait(3000);
  await rover.stop();
}
`;
    return <div className="app">
      <img className="app-logo" src={logo} alt="logo" />
      <p>RoverFront</p>

      <RoverEditor initialCode={startCode} ref={(editor) => this.editor = editor} />

      <button onClick={this.runCode}>Run</button>
    </div>;
  }
}

export default App;
