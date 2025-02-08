import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

/**
 * Revised parseBPMN:
 * 
 * The algorithm works as follows:
 * 1. Split the input text into “blocks” separated by one or more blank lines.
 * 2. In each block the first line is the decision (or task) text.
 * 3. Blocks with the same decision text are grouped together.
 * 4. If the decision text ends with a "?", we treat the group as a conditional branch group;
 *    otherwise, as a non-conditional branch group.
 * 5. For non-conditional groups, each block is assumed to have two lines:
 *    [decision, outcome] so that the connection is: decision --> outcome --> End.
 * 6. For conditional groups, blocks can have either two or three lines:
 *    - If three lines: [decision, condition label, task] so that the connection is:
 *      decision --> branch-start --> |condition label| outcome --> End.
 *    - If two lines: [decision, alternative condition label] so that the connection is:
 *      decision --> branch-start --> |alternative condition label| End.
 * 7. In each group a subgraph is generated. Its name is chosen based on whether the branch is conditional.
 *    The end marker node is built from a sanitized version of that name.
 */
const parseBPMN = (text) => {
  // Split input into blocks (using blank lines as separators)
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

  // Process each group to produce a subgraph
  groups.forEach(group => {
    // Determine group type (conditional if decision text ends with '?')
    const isConditional = group.decisionText.endsWith('?');
    const subgraphName = isConditional ? "Branch With Conditions" : "Branch Without Conditions";
    // Sanitize name for end marker (e.g. replace spaces with underscores)
    const sanitizedName = subgraphName.replace(/ /g, '_');
    const endMarkerId = `End${sanitizedName}`;
    
    const linesOut = [];
    linesOut.push(`subgraph ${subgraphName}`);
    
    // Create (or reuse) the decision node.
    // For conditional, we use a diamond node { } ; otherwise a rectangle [ ].
    const decisionNodeId = `n${nodeCounter++}`;
    const decisionNodeLine = isConditional
      ? `${decisionNodeId}{\"${group.decisionText}\"}`
      : `${decisionNodeId}[\"${group.decisionText}\"]`;
    linesOut.push(decisionNodeLine);

    // For conditional branches, create a common branch-start node.
    let branchStartId = null;
    if (isConditional) {
      branchStartId = `x${branchCounter++}`;
      linesOut.push(`${branchStartId}{x}`);
    }
    
    // To hold connection (arrow) definitions
    const connectionLines = [];
    
    group.blocks.forEach(blockLines => {
      if (isConditional) {
        // For conditional groups:
        // - 3 lines: [decision, condition label, task]
        // - 2 lines: [decision, alternative condition label]
        if (blockLines.length === 3) {
          const conditionLabel = blockLines[1];
          const outcomeText = blockLines[2];
          const outcomeNodeId = `n${nodeCounter++}`;
          linesOut.push(`${outcomeNodeId}[\"${outcomeText}\"]`);
          connectionLines.push(
            `${decisionNodeId} --> ${branchStartId} --> |${conditionLabel}| ${outcomeNodeId} --> ${endMarkerId}`
          );
        } else if (blockLines.length === 2) {
          const conditionLabel = blockLines[1];
          connectionLines.push(
            `${decisionNodeId} --> ${branchStartId} --> |${conditionLabel}| ${endMarkerId}`
          );
        }
      } else {
        // For non-conditional groups, we expect two lines: [decision, outcome]
        if (blockLines.length === 2) {
          const outcomeText = blockLines[1];
          const outcomeNodeId = `n${nodeCounter++}`;
          linesOut.push(`${outcomeNodeId}[\"${outcomeText}\"]`);
          connectionLines.push(
            `${decisionNodeId} --> ${outcomeNodeId} --> ${endMarkerId}`
          );
        }
      }
    });

    // Add the end marker node
    linesOut.push(`${endMarkerId}((( )))`);
    // Append all connection definitions
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
