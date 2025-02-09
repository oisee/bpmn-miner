import { parseBPMN } from './parseBPMN';

describe('parseBPMN', () => {
  it('should generate correct Mermaid code for given BPMN input', () => {
    const input = `
    Branch Without Conditions:
    Decision Task
    Step

    Decision Task
    Alternative Step

    Branch With Conditions:
    Decision Task?
    Condition
    Next Step

    Decision Task?
    Alternative Condition
    `;

    const expectedOutput = `graph TD
subgraph Branch Without Conditions
n1["Decision Task"]
n2["Step"]
n3["Alternative Step"]
EndBranch_Without_Conditions((( )))
n1 --> n2 --> EndBranch_Without_Conditions
n1 --> n3 --> EndBranch_Without_Conditions
end
subgraph Branch With Conditions
n4{"Decision Task?"}
n5["Next Step"]
EndBranch_With_Conditions((( )))
n4 --> |Condition| n5 --> EndBranch_With_Conditions
n4 --> |Alternative Condition| EndBranch_With_Conditions
end`;

    expect(parseBPMN(input).trim()).toBe(expectedOutput.trim());
  });
});