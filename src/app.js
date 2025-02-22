require("dotenv").config();
const express = require("express");
const cors = require('cors'); 
const { google } = require("googleapis");
const MailjetClient = require("./mailjet_client");
const TelexClient = require("./telex_client");
const ProposalHandler = require("./proposal_handler");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path"); 

const app = express();
app.use(express.json());


// Enable CORS for all routes
app.use(cors());

// Load config.json
const configPath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8")).data;

// Debug: Log Google Credentials Path
console.log("Google Credentials Path:", process.env.GOOGLE_CREDENTIALS_PATH);

// Google Sheets API setup
const sheets = google.sheets("v4");
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_CREDENTIALS_PATH, // Path to your Google Cloud credentials
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Initialize clients
const mailjetClient = new MailjetClient(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY);
const telexClient = new TelexClient(process.env.TELEX_WEBHOOK_URL);

// Extract settings from config
const approvalCriteria = {
  min_budget: config.settings.find((s) => s.label === "Minimum Budget").default,
  max_budget: config.settings.find((s) => s.label === "Maximum Budget").default,
  required_fields: config.settings.find((s) => s.label === "Required Fields").options,
};

const proposalHandler = new ProposalHandler(approvalCriteria);

// Fetch new submissions from Google Sheets
const fetchSubmissions = async () => {
  try {
    console.log("Authenticating with Google Sheets API...");
    const authClient = await auth.getClient();
    console.log("Authentication successful.");

    const spreadsheetId = process.env.SPREADSHEET_ID;
    const range = "Sheet1!A2:F"; // Adjust the range based on your sheet

    console.log("Fetching data from Google Sheets...");
    const response = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId,
      range,
    });

    console.log("Fetched data from Google Sheets:", response.data.values);
    return response.data.values || [];
  } catch (error) {
    console.error("Error fetching submissions from Google Sheets:", error);
    throw error;
  }
};

// Function to process submissions
const processSubmissions = async () => {
  try {
    const submissions = await fetchSubmissions();

    if (submissions.length === 0) {
      console.log("No new submissions to process.");
      return;
    }

    // Destructure config values
    const { telex_notifications, email_notifications } = config.output.reduce((acc, o) => {
      acc[o.label] = o.value;
      return acc;
    }, {});

    for (const submission of submissions) {
      const [name, email, projectTitle, budget, description] = submission;

      // Validate submission data
      if (!name || !email || !projectTitle || isNaN(budget) || !description) {
        console.error("Invalid submission data:", submission);
        continue; // Skip this submission
      }

      const proposal = { name, email, projectTitle, budget: Number(budget), description };

      console.log("Processing proposal:", proposal);

      // Evaluate proposal
      const { isApproved, message } = proposalHandler.evaluateProposal(proposal);
      console.log("Proposal evaluation result:", { isApproved, message });

      // Send Telex notification if enabled
      if (telex_notifications) {
        try {
          await telexClient.sendAlert({
            event_name: "proposal_submitted",
            status: "success",
            messages: `New proposal submitted: thans by ${name}`,
            username: "telex_integration",
          });
          console.log("Telex notification sent successfully.");
        } catch (error) {
          console.error("Failed to send Telex notification:", error);
        }
      }

      // Send email notification if enabled
      if (email_notifications) {
        const emailSubject = isApproved ? "Proposal Approved" : "Proposal Rejected";
        const emailBody = isApproved
          ? `Your proposal "${projectTitle}" has been approved. ${message}`
          : `Your proposal "${projectTitle}" has been rejected. Reason: ${message}`;

        try {
          await mailjetClient.sendEmail(email, emailSubject, emailBody);
          console.log("Email sent successfully to:", email);
        } catch (error) {
          console.error("Failed to send email to:", email, error);
        }
      }
    }

    console.log("Submissions processed successfully.");
  } catch (error) {
    console.error("Error processing submissions:", error);
  }
};

// Root route
app.get("/", (req, res) => {
  res.json({
    app_name: config.descriptions.app_name,
    app_description: config.descriptions.app_description,
    app_url: config.descriptions.app_url,
    integration_type: config.integration_type,
    is_active: config.is_active,
  });
});

// New route to return the entire config.json file
app.get("/config", (req, res) => {
  try {
    // Read the config.json file
    const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
    res.json(configData); // Send the entire config as a JSON response
  } catch (error) {
    console.error("Error reading config file:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to manually trigger submission processing
app.post("/process-submissions", async (req, res) => {
  try {
    await processSubmissions();
    res.status(200).send("Submissions processed successfully.");
  } catch (error) {
    console.error("Error processing submissions:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Schedule a cron job to process submissions every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("Running cron job to process submissions...");
  await processSubmissions();
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});