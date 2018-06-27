
import * as React from 'react';
import './app.css';

import * as moment from "moment";
import logo from './logo.png';
import RoverEditor from './components/roverEditor';
import { compileTs } from './modules/tsCompiler';
import * as connections from './modules/connections';
import { roverSettings } from './modules/globals';
import Rover from 'src/modules/rover';
import { IRover } from './rover';

class App extends React.Component {

  private rover: Rover;
  private cameraImage: HTMLImageElement | null;

  constructor(props: any) {
    super(props);
    this.rover = new Rover();

    setTimeout(() => {
      const url = this.getCameraUrl();
      if (this.cameraImage) {
        this.cameraImage.src = url + "?" + moment().valueOf()
      }
    }, 5000);
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

  private getCameraUrl() {
    return "http://" + roverSettings.host + "/camera";
  }

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
      <nav><p>RoverFront</p></nav>
      <main>
        <div className="editor">
          <div className="main">
            <RoverEditor initialCode={startCode} ref={(editor) => this.editor = editor} />
          </div>
          <div className="commands">
            <button onClick={this.runCode}>Run</button>
          </div>
        </div>
        <div className="monitor">
          <div className="stats">stats</div>
          <div className="camera">
            <img src={this.getCameraUrl()} ref={cameraImage => this.cameraImage = cameraImage} />
          </div>
        </div>
      </main>
    </div>;
  }
}

export default App;
