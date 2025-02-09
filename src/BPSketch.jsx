import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { parseBPMN } from './utils/parseBPMN';

const BPSketch = () => {
  const [input, setInput] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');

  useEffect(() => {
    if (input) {
      const code = parseBPMN(input);
      setMermaidCode(code);
    }
  }, [input]);

  return (
    <div className="flex flex-col space-y-4 w-full max-w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>BPMN Sketch</CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          <div className="grid grid-cols-5 gap-4 w-full min-w-0">
            {/* Input Area - Takes 2 Columns */}
            <div className="flex flex-col col-span-2">
              <h3 className="text-lg font-medium mb-2">Input</h3>
              <textarea
                className="w-full h-96 p-2 border rounded font-mono text-sm resize"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your process description here..."
              />
            </div>
            {/* Mermaid Code Area - Takes 3 Columns */}
            <div className="flex flex-col col-span-3">
              <h3 className="text-lg font-medium mb-2">Mermaid Code</h3>
              <pre className="w-full h-96 p-2 border rounded overflow-auto bg-gray-50 text-sm">
                {mermaidCode}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BPSketch;