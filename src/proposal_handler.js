class ProposalHandler {
    constructor(criteria) {
      this.criteria = criteria;
    }
  
    evaluateProposal(proposal) {
      // Check required fields
      for (const field of this.criteria.required_fields) {
        if (!proposal[field]) {
          return {
            isApproved: false,
            message: `Your proposal is missing the required field: ${field}. Please include this information and resubmit.`
          };
        }
      }
  
      // Check budget
      if (proposal.budget < this.criteria.min_budget) {
        return {
          isApproved: false,
          message: `Your budget of ${proposal.budget} is below the minimum required budget of ${this.criteria.min_budget}. Please revise your budget and resubmit.`
        };
      }
      if (proposal.budget > this.criteria.max_budget) {
        return {
          isApproved: false,
          message: `Your budget of ${proposal.budget} exceeds the maximum allowed budget of ${this.criteria.max_budget}. Please revise your budget and resubmit.`
        };
      }
  
      // If all criteria are met
      return {
        isApproved: true,
        message: `Your proposal meets all criteria and has been approved. The allocated budget is ${proposal.budget}.`
      };
    }
  }
  
  module.exports = ProposalHandler;