package main

import (
	"encoding/json"
	"github.com/nsf/jsondiff"
	"syscall/js"
)

type Options struct {
	AppendType             bool `json:"appendType"`
	SkipMatches            bool `json:"skipMatches"`
	SuppressSkippedStrings bool `json:"suppressSkippedStrings"`
}

type Input struct {
	A       string  `json:"a"`
	B       string  `json:"b"`
	Options Options `json:"options"`
}

type Output struct {
	Status  string `json:"status,omitempty"`
	Details string `json:"details,omitempty"`
	Error   string `json:"error,omitempty"`
}

func writeOutput(output Output) {
	// error never happens
	bytes, _ := json.Marshal(&output)
	js.Global().Set("wasmOutput", string(bytes))
}

func main() {
	val := js.Global().Get("wasmInput")
	if val.Type() != js.TypeString {
		writeOutput(Output{Error: "wasmInput global must be a string"})
		return
	}
	var input Input
	err := json.Unmarshal([]byte(val.String()), &input)
	if err != nil {
		writeOutput(Output{Error: "failed parsing input: " + err.Error()})
		return
	}

	opts := jsondiff.DefaultHTMLOptions()
	if input.Options.AppendType {
		opts.PrintTypes = true
	}
	if input.Options.SkipMatches {
		opts.SkipMatches = true
	}
	if input.Options.SuppressSkippedStrings {
		opts.SkippedArrayElement = nil
		opts.SkippedObjectProperty = nil
	}
	diff, details := jsondiff.Compare([]byte(input.A), []byte(input.B), &opts)
	writeOutput(Output{
		Status:  diff.String(),
		Details: details,
	})
}
