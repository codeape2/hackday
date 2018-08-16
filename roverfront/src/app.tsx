
import * as moment from "moment";
import * as React from 'react';
import './app.css';
import RoverEditor from './components/roverEditor';
import RoverSimulationContainer from './components/roverSimulationContainer';
import RoverStats from './components/roveStats';
import { IRoverHandler } from './contracts';
import { roverSettings } from './modules/globals';
import SimulatedRover from './modules/simulatedRover';
import { compileTs } from './modules/tsCompiler';
import { IRover } from './rover';


class App extends React.Component {

  private rover: SimulatedRover;
  private roverHandler: IRoverHandler;
  private cameraImage: HTMLImageElement | null;

  constructor(props: any) {
    super(props);

    this.roverHandler = {};
    //this.rover = new Rover();
    this.rover = new SimulatedRover(this.roverHandler);

    setTimeout(() => {
      const url = this.getCameraUrl();
      if (this.cameraImage) {
        this.cameraImage.src = url + "?" + moment().valueOf()
      }
    }, 5000);
  }

  private editor: RoverEditor | null;

  private runCode = async () => {
    if (!this.editor) {
      return;
    }

    const tsCode = this.editor.currentCode;
    const jsCode = compileTs(tsCode);

    const instance = eval(jsCode) as (rover: IRover) => Promise<any>;
    if (typeof instance === "function") {
      instance(this.rover);
    }
  };

  private clearSimulation = async () => {
    if (this.roverHandler.clearSimulation) {
      this.roverHandler.clearSimulation();
    }
  };

  private getCameraUrl() {
    return "http://" + roverSettings.host + "/camera";
  }

  public getInitialCode() {
    const code = localStorage.getItem(roverSettings.codeKey);
    if (code && code.length) {
      return code;
    }

    return `
    async (rover: IRover) => {
      // Your code here
      await rover.forward(2, 1);
      await rover.forward(2, 5);
      await rover.wait(3);
      await rover.reverse(4, 3);
      await rover.left(1, 1);
      await rover.right(1, 1);
    }
    `;
  }

  public render() {

    return <div className="app">
      <nav><p>RoverFront</p></nav>
      <main>
        <div className="editor">
          <div className="main">
            <RoverEditor initialCode={this.getInitialCode()} ref={(editor) => this.editor = editor} />
          </div>
          <div className="commands">
            <button onClick={this.runCode}>Run</button>
            <button onClick={this.clearSimulation}>Clear</button>
          </div>
        </div>
        <div className="monitor">
          <div className="stats"><RoverStats /></div>

          <div className="camera">
            {/*<img src={this.getCameraUrl()} ref={cameraImage => this.cameraImage = cameraImage} />*/}
            <RoverSimulationContainer rover={this.roverHandler} cameraFollowRover={true} />
          </div>
        </div>
      </main>
    </div>;
  }
}

export default App;
