import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

// Parse text into BPMN elements
const parseBPMN = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    let mermaidCode = '';
    let nodeId = 1;
    let branchId = 1;
    let pools = new Map();
    let currentPool = null;
  
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('///') || line === '') continue; // Skip comments and empty lines
  
      // Handle pool definitions
      if (line.endsWith(':')) {
        currentPool = line.slice(0, -1);
        pools.set(currentPool, [`subgraph ${currentPool}`]);
        continue;
      }
  
      // Identify decision points and branching logic
      if (line.endsWith('?')) {
        const conditionNode = `n${nodeId}{"${line}"}`;
        pools.get(currentPool).push(conditionNode);
        nodeId++;
  
        // Create branching points for conditions
        const branchStart = `x${branchId}{x}`;
        pools.get(currentPool).push(branchStart);
        branchId++;
        continue;
      }
  
      // Handle regular tasks or conditions
      const taskNode = `n${nodeId}["${line}"]`;
      pools.get(currentPool).push(taskNode);
      nodeId++;
    }
  
    // Add subgraph start and end markers
    pools.forEach((nodes, poolName) => {
      nodes.push(`End${poolName}((( )))`);
      nodes.push('end');
      mermaidCode += nodes.join('\n') + '\n';
    });
  
    return `graph TD\n` + mermaidCode;
  };
  

const BPMNSketchMiner = () => {
  const [input, setInput] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');

  useEffect(() => {
    if (input) {
      const code = parseBPMN(input);
      setMermaidCode(code);
    }
  }, [input]);

  return (
    <div className="flex flex-col space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>BPMN Sketch Miner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Input Area */}
            <div>
              <h3 className="text-lg font-medium mb-2">Input</h3>
              <textarea 
                className="w-full h-96 p-2 border rounded font-mono text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your process description here..."
              />
            </div>

            {/* Mermaid Code Area */}
            <div>
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

export default BPMNSketchMiner;