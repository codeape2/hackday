import * as React from 'react';
import './app.css';

import logo from './logo.png';
import RoverEditor from './components/roverEditor';
import { compileTs } from './modules/tsCompiler';

class App extends React.Component {

  private editor: RoverEditor | null;

  private runCode = () => {
    if (!this.editor) {
      return;
    }

    const tsCode = this.editor.currentCode;
    const jsCode = compileTs(tsCode);

    // Just execute the code for now. We might want to return some object here.
    const instance = eval(jsCode);
  };


  public render() {
    const startCode =
      `const x: string = "heyo";\r\nalert(x);`;
    return <div className="app">
      <img className="app-logo" src={logo} alt="logo" />
      <p>RoverFront</p>

      <RoverEditor initialCode={startCode} ref={(editor) => this.editor = editor} />

      <button onClick={this.runCode}>Run</button>
    </div>;
  }
}

export default App;
