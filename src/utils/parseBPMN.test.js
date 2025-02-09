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
s1(( ))
n1["Decision Task"]
n2["Step"]
n3["Alternative Step"]
e1((( )))
s1 --> n1
n1 --> n2 --> e1
n1 --> n3 --> e1
end
subgraph Branch With Conditions
s2(( ))
n4{"Decision Task?"}
n5["Next Step"]
e2((( )))
s2 --> n4
n4 --> |Condition| n5 --> e2
n4 --> |Alternative Condition| e2
end`;

    expect(parseBPMN(input).trim()).toBe(expectedOutput.trim());
  });
});

//#------------------------------------------------
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

Lane3:
Seq Task1
Seq task2

Seq task3
Seq task4
    `;

    const expectedOutput = `graph TD
subgraph Branch Without Conditions
s1(( ))
n1["Decision Task"]
n2["Step"]
n3["Alternative Step"]
e1((( )))
s1 --> n1
n1 --> n2 --> e1
n1 --> n3 --> e1
end
subgraph Branch With Conditions
s2(( ))
n4{"Decision Task?"}
n5["Next Step"]
e2((( )))
s2 --> n4
n4 --> |Condition| n5 --> e2
n4 --> |Alternative Condition| e2
end
subgraph Lane3
s3(( ))
n6["Seq Task1"]
n7["Seq task2"]
n8["Seq task3"]
n9["Seq task4"]
e3((( )))
s3 --> n6 --> n7 --> n8 --> n9 --> e3
end`;

    expect(parseBPMN(input).trim()).toBe(expectedOutput.trim());
  });
});
