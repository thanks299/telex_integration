const Mailjet = require("node-mailjet");

class MailjetClient {
    constructor(apiKey, apiSecret) {
        this.client = Mailjet.apiConnect(apiKey, apiSecret);
    }

    async sendEmail(to, subject, text) {
        if (!to || !subject || !text) {
            throw new Error("Missing required parameters: 'to', 'subject', or 'text'");
        }

        const request = this.client.post("send", { version: "v3.1" }).request({
            Messages: [
                {
                    From: {
                        Email: "noreply@example.com",
                        Name: "Proposal Approval System"
                    },
                    To: [
                        {
                            Email: to,
                            Name: "Proposal Submitter"
                        }
                    ],
                    Subject: subject,
                    TextPart: text
                }
            ]
        });

        try {
            const response = await request;
            console.log("Mailjet response:", response.body); // Log the response
            return response.body;
        } catch (err) {
            console.error("Mailjet error:", err.message); // Log the error
            throw new Error(`Failed to send email: ${err.message}`);
        }
    }
}

module.exports = MailjetClient;