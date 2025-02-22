const ProposalHandler = require("../src/proposal_handler");

describe("ProposalHandler", () => {
  const criteria = {
    min_budget: 1000,
    max_budget: 10000,
    required_fields: ["projectTitle", "budget", "description"]
  };

  const handler = new ProposalHandler(criteria);

  test("approves valid proposal", () => {
    const proposal = {
      projectTitle: "New Project",
      budget: 5000,
      description: "A great project"
    };
    const result = handler.evaluateProposal(proposal);
    expect(result.isApproved).toBe(true);
    expect(result.message).toContain("approved");
  });

  test("rejects proposal with missing field", () => {
    const proposal = {
      projectTitle: "New Project",
      budget: 5000
    };
    const result = handler.evaluateProposal(proposal);
    expect(result.isApproved).toBe(false);
    expect(result.message).toContain("missing the required field");
  });

  test("rejects proposal with low budget", () => {
    const proposal = {
      projectTitle: "New Project",
      budget: 500,
      description: "A great project"
    };
    const result = handler.evaluateProposal(proposal);
    expect(result.isApproved).toBe(false);
    expect(result.message).toContain("below the minimum required budget");
  });
});