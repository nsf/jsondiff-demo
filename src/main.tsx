/**
 * @jsx h
 * @jsxFrag Fragment
 */

import "./styles.css";
import { h, Fragment, render } from "preact";
import { useState } from "preact/hooks";

const initialA = `{"format":"example","content":[{"align":"center","depth":0,"list":false,"content":[{"style":{"underline":1,"bold":2,"size":20,"italic":2,"color":"FFFFFF","fontFamily":"Arial"},"content":"And please, feel free to send us your feedback and comments to "},{"style":{"underline":1,"bold":2,"size":20,"italic":2,"color":"4DC3FF","fontFamily":"Arial"},"content":"hello world"},{"style":{"underline":1,"bold":2,"size":20,"italic":2,"color":"FFFFFF","fontFamily":"Arial"},"content":", or just by clicking on the "},{"style":{"underline":1,"bold":2,"size":20,"italic":2,"color":"4DC3FF","fontFamily":"Arial"},"content":"feedback"}],"ordered":false}],"version":3}`;
const initialB = `{"format":"example","version":3.1,"content":[{"list":false,"depth":0,"ordered":false,"content":[{"content":"And please, feel free to send us your feedback and comments to ","style":{"size":20,"color":"FFFFFF","name":"Arial","bold":2,"italic":2,"underline":2}},{"content":"foo","style":{"size":20,"color":"4DC2FF","name":"Arial","bold":2,"italic":2,"underline":2}},{"content":", or just by clicking on the ","style":{"size":20,"color":"FFFFFF","name":"Arial","bold":2,"italic":2,"underline":2}},{"content":"feedback","style":{"size":20,"color":"4DC2FF","name":"Arial","bold":2,"italic":2,"underline":2}},{"content":" button up above.","style":{"size":20,"color":"FFFFFF","name":"Arial","bold":2,"italic":2,"underline":2}}],"align":"center"}]}`;

const MainUI = () => {
  const [input, setInput] = useState<Input>({ a: initialA, b: initialB, options: {} });
  const [output, setOutput] = useState<Output>({});

  const checkbox = (field: keyof Options, label: string) => (
    <div>
      <label>
        <input
          type="checkbox"
          checked={!!input.options?.[field]}
          onChange={() => {
            setInput({ ...input, options: { ...input.options, [field]: !input.options?.[field] } });
          }}
        />
        <span className="ml-2">{label}</span>
      </label>
    </div>
  );

  const button = (label: string, onClick: () => void) => (
    <button onClick={onClick} type="button" className="px-10 py-2 bg-gray-100 hover:bg-gray-200 cursor-pointer">
      {label}
    </button>
  );

  const outputBlock = (label: string, innerHTML: string) => (
    <>
      <div>{label}</div>
      <pre className="bg-gray-100 border p-1 overflow-auto" dangerouslySetInnerHTML={{ __html: innerHTML || "" }} />
    </>
  );

  const inputBlock = (value: string, onChange: (v: string) => void) => (
    <textarea
      className="p-1 w-full"
      rows={12}
      value={value}
      onChange={(e) => {
        onChange(e.currentTarget.value);
      }}
    />
  );

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-3xl break-all">github.com/nsf/jsondiff</h1>
      <div className="flex w-full flex-col space-y-2 space-x-0 sm:flex-row sm:space-x-2 sm:space-y-0">
        {inputBlock(input.a, (a) => setInput({ ...input, a }))}
        {inputBlock(input.b, (b) => setInput({ ...input, b }))}
      </div>
      <div className="flex flex-wrap gap-2">
        {button("compare", async () => {
          setOutput(await jsonDiff(input));
        })}
        {button("swap", () => {
          setInput({ ...input, a: input.b, b: input.a });
        })}
        {button("clear", () => {
          setInput({ ...input, a: "", b: "" });
        })}
      </div>
      {checkbox("appendType", "append types")}
      {checkbox("skipMatches", "skip matches")}
      {input.options?.skipMatches ? checkbox("suppressSkippedStrings", 'suppress "skipped" strings') : null}
      {output?.error ? outputBlock("error", output.error) : null}
      {output?.status ? outputBlock("status", output.status) : null}
      {output?.details ? outputBlock("details", output.details) : null}
    </div>
  );
};

interface Options {
  appendType?: boolean;
  skipMatches?: boolean;
  suppressSkippedStrings?: boolean;
}

interface Input {
  a: string;
  b: string;
  options?: Options;
}

interface Output {
  status?: string;
  details?: string;
  error?: string;
}

const go = new Go();
const inst = WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject);

async function jsonDiff(input: Input): Promise<Output> {
  const result = await inst;
  (window as any).wasmInput = JSON.stringify(input);
  await go.run(result.instance);
  return JSON.parse((window as any).wasmOutput) as Output;
}

(async () => {
  const el = document.createElement("div");
  document.body.appendChild(el);
  render(<MainUI />, el);
})();
