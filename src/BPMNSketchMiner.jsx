import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

// Parse text into BPMN elements
const parseBPMN = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  let mermaidCode = 'graph TD\n';
  let nodeId = 0;
  let pools = new Map();
  let currentPool = null;
  
  // Add Start event
  mermaidCode += `  Start(( ))\n`;
  nodeId++;

  for (let line of lines) {
    line = line.trim();
    
    // Skip comments
    if (line.startsWith('///')) continue;
    
    // Handle pool definitions
    if (line.endsWith(':')) {
      currentPool = line.slice(0, -1);
      if (!pools.has(currentPool)) {
        pools.set(currentPool, []);
      }
      continue;
    }

    // Handle pool task annotations
    if (line.includes(':')) {
      const [pool, task] = line.split(':').map(s => s.trim());
      if (!pools.has(pool)) {
        pools.set(pool, []);
      }
      pools.get(pool).push(`n${nodeId}`);
      mermaidCode += `  n${nodeId}["${task}"]\n`;
      if (nodeId > 1) {
        mermaidCode += `  n${nodeId-1} --> n${nodeId}\n`;
      } else {
        mermaidCode += `  Start --> n${nodeId}\n`;
      }
      nodeId++;
      continue;
    }

    // Handle gateway questions
    if (line.endsWith('?')) {
      mermaidCode += `  n${nodeId}{"${line}"}\n`;
      if (currentPool) {
        pools.get(currentPool).push(`n${nodeId}`);
      }
      if (nodeId > 1) {
        mermaidCode += `  n${nodeId-1} --> n${nodeId}\n`;
      }
      nodeId++;
      continue;
    }

    // Handle regular tasks
    // Check if task already exists
    const existingNode = [...mermaidCode.matchAll(/n\d+\["([^"]+)"\]/g)]
      .find(match => match[1] === line);
    
    if (existingNode) {
      // If task exists, just add flow to existing node
      mermaidCode += `  n${nodeId-1} --> ${existingNode[0].split('[')[0]}\n`;
    } else {
      // Create new task node
      //mermaidCode += `  n${nodeId}["${task}"]\n`;
      mermaidCode += `n${nodeId}["${line}"]\n`;
      if (currentPool) {
        pools.get(currentPool).push(`n${nodeId}`);
      }
      // Add sequence flow
      if (nodeId > 1) {
        mermaidCode += `  n${nodeId-1} --> n${nodeId}\n`;
      } else {
        mermaidCode += `  Start --> n${nodeId}\n`;
      }
      nodeId++;
    }
  }

  // Add pools
  pools.forEach((nodes, poolName) => {
    if (nodes.length > 0) {
      mermaidCode += `  subgraph ${poolName}\n`;
      nodes.forEach(node => {
        mermaidCode += `    ${node}\n`;
      });
      mermaidCode += '  end\n';
    }
  });

  // Add End event and connect to last node
  mermaidCode += `  End((( )))\n`;
  mermaidCode += `  n${nodeId-1} --> End\n`;
  return mermaidCode;
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