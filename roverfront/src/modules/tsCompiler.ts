import * as typescript from "typescript";

export function compileTs(code: string) {
    const compiled = typescript.transpileModule(code, {

    });

    return compiled.outputText;
}