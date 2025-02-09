export const parseBPMN = (text) => {
    const lines = text.split('\n');
    const pools = [];
    let currentPool = null;
    let currentBlock = [];
  
    // When a block is finished, push it into the current pool.
    const pushBlock = () => {
      if (currentBlock.length > 0) {
        // If we haven’t created a pool yet, use a default one.
        if (!currentPool) {
          currentPool = { poolName: "Default", blocks: [] };
        }
        currentPool.blocks.push(currentBlock);
        currentBlock = [];
      }
    };
  
    // Process each line. If we see a lane definition (line ending with ':'), then that
    // starts a new pool. Otherwise, non-empty lines go to the current block.
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line === '') {
        pushBlock();
        continue;
      }
      if (line.endsWith(':')) {
        // New lane definition encountered.
        pushBlock();
        // If there’s an existing pool with blocks, push it into the pools array.
        if (currentPool && currentPool.blocks.length > 0) {
          pools.push(currentPool);
        }
        currentPool = { poolName: line.slice(0, -1), blocks: [] };
      } else {
        // If no lane has been defined yet, we automatically create a default one.
        if (!currentPool) {
          currentPool = { poolName: "Default", blocks: [] };
        }
        currentBlock.push(line);
      }
    }
    pushBlock();
    if (currentPool && currentPool.blocks.length > 0) {
      pools.push(currentPool);
    }
  
    // Begin generating the Mermaid code.
    let mermaidCode = 'graph TD\n';
    let nodeCounter = 1;
    let poolCounter = 1; // used to create unique start (sX) and end (eX) IDs per pool
  
    pools.forEach(pool => {
      const linesOut = [];
      const subgraphName = pool.poolName;
      linesOut.push(`subgraph ${subgraphName}`);
  
      // Create a start and end marker for the lane.
      const startId = `s${poolCounter}`;
      const endId = `e${poolCounter}`;
      poolCounter++;
      linesOut.push(`${startId}(( ))`);
  
      // Filter out any accidental empty blocks.
      const blocks = pool.blocks.filter(block => block.length > 0);
      if (blocks.length === 0) {
        // If this lane is empty, just add the end marker.
        linesOut.push(`${endId}((( )))`);
        linesOut.push("end");
        mermaidCode += linesOut.join('\n') + '\n';
        return;
      }
  
      // Decide whether to use branch mode or sequential mode.
      // Branch mode applies when either:
      //   a) The first line ends with '?' (i.e. conditional), or
      //   b) All blocks start with the same decision text.
      const firstDecision = blocks[0][0];
      const isConditional = firstDecision.endsWith('?');
      const allSame = blocks.every(block => block[0] === firstDecision);
      const branchMode = isConditional || allSame;
  
      if (branchMode) {
        // Create one decision node for all branches.
        const decisionNodeId = `n${nodeCounter++}`;
        if (isConditional) {
          linesOut.push(`${decisionNodeId}{\"${firstDecision}\"}`);
        } else {
          linesOut.push(`${decisionNodeId}[\"${firstDecision}\"]`);
        }
        // Connect start to the decision node.
        const connections = [];
        connections.push(`${startId} --> ${decisionNodeId}`);
  
        // Process each branch.
        blocks.forEach(block => {
          if (isConditional) {
            // Expect two variants:
            //   [decision, condition label] or [decision, condition label, outcome]
            if (block.length === 3) {
              const conditionLabel = block[1];
              const outcomeText = block[2];
              const outcomeNodeId = `n${nodeCounter++}`;
              linesOut.push(`${outcomeNodeId}[\"${outcomeText}\"]`);
              connections.push(`${decisionNodeId} --> |${conditionLabel}| ${outcomeNodeId} --> ${endId}`);
            } else if (block.length === 2) {
              const conditionLabel = block[1];
              connections.push(`${decisionNodeId} --> |${conditionLabel}| ${endId}`);
            }
          } else {
            // Non-conditional branch mode: each block has [decision, outcome]
            if (block.length === 2) {
              const outcomeText = block[1];
              const outcomeNodeId = `n${nodeCounter++}`;
              linesOut.push(`${outcomeNodeId}[\"${outcomeText}\"]`);
              connections.push(`${decisionNodeId} --> ${outcomeNodeId} --> ${endId}`);
            }
          }
        });
        linesOut.push(`${endId}((( )))`);
        linesOut.push(...connections);
      } else {
        // Sequential mode: chain blocks one after the other.
        // In sequential lanes (like your Lane3), each block is assumed to have exactly two lines.
        const seqNodes = [];
        blocks.forEach(block => {
          if (block.length >= 2) {
            const firstNodeId = `n${nodeCounter++}`;
            const secondNodeId = `n${nodeCounter++}`;
            linesOut.push(`${firstNodeId}[\"${block[0]}\"]`);
            linesOut.push(`${secondNodeId}[\"${block[1]}\"]`);
            seqNodes.push(firstNodeId, secondNodeId);
          }
        });
        linesOut.push(`${endId}((( )))`);
        if (seqNodes.length > 0) {
          // Chain from start, through all nodes, to end.
          linesOut.push([startId, ...seqNodes, endId].join(' --> '));
        }
      }
      linesOut.push("end");
      mermaidCode += linesOut.join('\n') + '\n';
    });
  
    return mermaidCode;
  };