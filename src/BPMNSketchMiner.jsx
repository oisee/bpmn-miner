import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

const parseBPMN = (text) => {
  // Split the input into blocks using blank lines as separators
  const rawBlocks = text.split(/\n\s*\n/);
  const groups = [];
  const groupMap = new Map();
  
  rawBlocks.forEach(blockStr => {
    const lines = blockStr
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    if (!lines.length) return;
    const decisionText = lines[0];
    if (groupMap.has(decisionText)) {
      groups[groupMap.get(decisionText)].blocks.push(lines);
    } else {
      groups.push({ decisionText, blocks: [lines] });
      groupMap.set(decisionText, groups.length - 1);
    }
  });
  
  let mermaidCode = 'graph TD\n';
  let nodeCounter = 1;
  let branchCounter = 1;
  
  groups.forEach(group => {
    const isConditional = group.decisionText.endsWith('?');
    const subgraphName = isConditional ? "Branch With Conditions" : "Branch Without Conditions";
    // Sanitize subgraph name for the end marker (e.g. spaces to underscores)
    const sanitizedName = subgraphName.replace(/ /g, '_');
    const endMarkerId = `End${sanitizedName}`;
    
    const linesOut = [];
    linesOut.push(`subgraph ${subgraphName}`);
    
    // Create the decision node.
    // For conditional groups, we use a diamond (curly braces); for non-conditional, a rectangle.
    const decisionNodeId = `n${nodeCounter++}`;
    const decisionNodeLine = isConditional
      ? `${decisionNodeId}{\"${group.decisionText}\"}`
      : `${decisionNodeId}[\"${group.decisionText}\"]`;
    linesOut.push(decisionNodeLine);
    
    // This array will hold our arrow connection lines.
    const connectionLines = [];
    
    if (isConditional) {
      // For conditional branches, create a branch start node.
      const branchStartId = `x${branchCounter++}`;
      linesOut.push(`${branchStartId}{x}`);
      // Add the common connection: decision --> branch start.
      connectionLines.push(`${decisionNodeId} --> ${branchStartId}`);
      
      // For each branch option, add the proper connection.
      group.blocks.forEach(blockLines => {
        // blockLines[0] is the decision text (shared) so we ignore it.
        if (blockLines.length === 3) {
          // Format: [decision, condition label, outcome]
          const conditionLabel = blockLines[1];
          const outcomeText = blockLines[2];
          const outcomeNodeId = `n${nodeCounter++}`;
          linesOut.push(`${outcomeNodeId}[\"${outcomeText}\"]`);
          connectionLines.push(`${branchStartId} --> |${conditionLabel}| ${outcomeNodeId} --> ${endMarkerId}`);
        } else if (blockLines.length === 2) {
          // Format: [decision, alternative condition label]
          const conditionLabel = blockLines[1];
          connectionLines.push(`${branchStartId} --> |${conditionLabel}| ${endMarkerId}`);
        }
      });
    } else {
      // For non-conditional groups, each block should have two lines: [decision, outcome].
      group.blocks.forEach(blockLines => {
        if (blockLines.length === 2) {
          const outcomeText = blockLines[1];
          const outcomeNodeId = `n${nodeCounter++}`;
          linesOut.push(`${outcomeNodeId}[\"${outcomeText}\"]`);
          connectionLines.push(`${decisionNodeId} --> ${outcomeNodeId} --> ${endMarkerId}`);
        }
      });
    }
    
    // Add the end marker node.
    linesOut.push(`${endMarkerId}((( )))`);
    // Append all connection definitions.
    linesOut.push(...connectionLines);
    linesOut.push("end");
    
    mermaidCode += linesOut.join('\n') + '\n';
  });
  
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
