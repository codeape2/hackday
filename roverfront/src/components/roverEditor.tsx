import * as monaco from 'monaco-editor';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { roverSettings } from '../modules/globals';
// import roverDefs from '../rover.txt';

interface IRoverEditorProps {
    initialCode: string;
}

export default class RoverEditor extends React.Component<IRoverEditorProps, {}> {
    private editorRef: monaco.editor.IEditor | undefined;

    constructor(props: IRoverEditorProps) {
        super(props);
        this.currentCode = props.initialCode;


        monaco.languages.typescript.typescriptDefaults.addExtraLib(
            `declare interface IRover {
    forward(seconds: number, speed: number): Promise<void>;
    stop(): Promise<void>;
    right(seconds: number, speed: number): Promise<void>;
    left(seconds: number, speed: number): Promise<void>;

    getRange(): number;
    reverse(seconds: number, speed: number): Promise<void>;

    wait(waitInSeconds: number): Promise<void>;
    stopWhenRangeLessThan(range: number): Promise<void>;
    stopWhenRangeGreaterThan(range: number): Promise<void>;
    waitForRangeLessThan(range: number): Promise<void>;
    waitForRangeGreaterThan(range: number): Promise<void>;
}

// For the monaco-editor. We don't have time to inject this properly there.
declare const rover: IRover;
`
            , "rover.d.ts");

        window.addEventListener('resize', () => {
            setTimeout(() => {
                if (this.editorRef) {
                    this.editorRef.layout();
                }
            }, 100);
        });
    }

    // A bit dirty, but let's just expose the code as a public field.
    public currentCode: string;

    private editorDidMount = (editor: monaco.editor.IEditor) => {
        this.editorRef = editor;
        editor.focus()
    }
    private onChange = (newValue: string) => {
        this.currentCode = newValue;

        localStorage.setItem(roverSettings.codeKey, this.currentCode);
    }

    public render() {
        const options: monaco.editor.IEditorConstructionOptions = {
            selectOnLineNumbers: true,
            minimap: {
                enabled: false
            }
        };

        return <MonacoEditor
            language="typescript"
            theme="vs-dark"
            value={this.currentCode}
            options={options}
            onChange={this.onChange}
            editorDidMount={this.editorDidMount}
        />;
    }
}
