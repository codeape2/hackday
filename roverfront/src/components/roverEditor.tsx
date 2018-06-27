import * as monaco from 'monaco-editor';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';

interface IRoverEditorProps {
    initialCode: string;
}

export default class RoverEditor extends React.Component<IRoverEditorProps, {}> {

    constructor(props: IRoverEditorProps) {
        super(props);
        this.currentCode = props.initialCode;
    }

    // A bit dirty, but let's just expose the code as a public field.
    public currentCode: string;

    private editorDidMount(editor: monaco.editor.IEditor) {
        editor.focus()
    }
    private onChange = (newValue: string) => {
        this.currentCode = newValue;
    }

    public render() {
        const options: monaco.editor.IEditorConstructionOptions = {
            selectOnLineNumbers: true
        };

        return <MonacoEditor
            width="800"
            height="600"
            language="typescript"
            theme="vs-dark"
            value={this.currentCode}
            options={options}
            onChange={this.onChange}
            editorDidMount={this.editorDidMount}
        />;
    }
}
