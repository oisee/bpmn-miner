export const parseBPMN = (text) => {
    // Split the text into lines
    const lines = text.split('\n');
    const pools = []; // Array of { poolName, blocks: string[][] }
    let currentPool = null;
    let currentBlock = [];
  
    // Helper: push the current block into the current pool
    const pushBlock = () => {
      if (currentBlock.length > 0 && currentPool) {
        currentPool.blocks.push(currentBlock);
        currentBlock = [];
      }
    };
  
    // Process each line to detect pool definitions and block content
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line === '') {
        // A blank line ends the current block
        pushBlock();
        continue;
      }
      if (line.endsWith(':')) {
        // This is a pool definition line.
        // First, finish any current block.
        pushBlock();
        // If there is an existing pool, push it into pools.
        if (currentPool) {
          pools.push(currentPool);
        }
        // Create a new pool.
        currentPool = {
          poolName: line.slice(0, -1), // remove the colon
          blocks: [],
        };
      } else {
        // Regular content line; add it to the current block.
        currentBlock.push(line);
      }
    }
    // Push any remaining block and pool.
    pushBlock();
    if (currentPool) {
      pools.push(currentPool);
    }
  
    let mermaidCode = 'graph TD\n';
    let nodeCounter = 1;
  
    pools.forEach(pool => {
      // Use the pool name as the subgraph title.
      const subgraphName = pool.poolName;
      // Sanitize the subgraph name (replace spaces with underscores) for the end marker.
      const sanitizedName = subgraphName.replace(/ /g, '_');
      const endMarkerId = `End${sanitizedName}`;
  
      const linesOut = [];
      linesOut.push(`subgraph ${subgraphName}`);
  
      if (pool.blocks.length === 0) {
        return; // skip empty pool
      }
  
      // Assume the decision text is the first line of the first block.
      const decisionText = pool.blocks[0][0];
      const isConditional = decisionText.endsWith('?');
  
      // Create the decision node (only one per pool)
      const decisionNodeId = `n${nodeCounter++}`;
      if (isConditional) {
        linesOut.push(`${decisionNodeId}{\"${decisionText}\"}`);
      } else {
        linesOut.push(`${decisionNodeId}[\"${decisionText}\"]`);
      }
  
      // Array to hold the connection (arrow) definitions.
      const connectionLines = [];
  
      // Process each block in the pool.
      pool.blocks.forEach(block => {
        // For each block, the first line is the decision text (which we assume is the same)
        if (isConditional) {
          // For a conditional branch, expect either:
          // - 3 lines: [decision, condition label, outcome]
          // - 2 lines: [decision, alternative condition label]
          if (block.length === 3) {
            const conditionLabel = block[1];
            const outcomeText = block[2];
            const outcomeNodeId = `n${nodeCounter++}`;
            linesOut.push(`${outcomeNodeId}[\"${outcomeText}\"]`);
            connectionLines.push(`${decisionNodeId} --> |${conditionLabel}| ${outcomeNodeId} --> ${endMarkerId}`);
          } else if (block.length === 2) {
            const conditionLabel = block[1];
            connectionLines.push(`${decisionNodeId} --> |${conditionLabel}| ${endMarkerId}`);
          }
        } else {
          // For a non-conditional branch, expect exactly 2 lines: [decision, outcome]
          if (block.length === 2) {
            const outcomeText = block[1];
            const outcomeNodeId = `n${nodeCounter++}`;
            linesOut.push(`${outcomeNodeId}[\"${outcomeText}\"]`);
            connectionLines.push(`${decisionNodeId} --> ${outcomeNodeId} --> ${endMarkerId}`);
          }
        }
      });
  
      // Add the end marker node.
      linesOut.push(`${endMarkerId}((( )))`);
      // Append connection lines.
      linesOut.push(...connectionLines);
      linesOut.push("end");
  
      mermaidCode += linesOut.join('\n') + '\n';
    });
  
    return mermaidCode;
  };