# Proposal Approval Automation

This project automates the process of approving proposals submitted via a Google Form. It fetches submissions from a Google Sheet, evaluates approval criteria, and sends notifications via Telex and Gmail. The application is built using Express.js and runs a cron job to periodically process submissions.

## Features

- Fetches proposal submissions from a Google Sheet.
- Evaluates approval criteria (e.g., budget limits).
- Sends real-time notifications to Telex for new submissions and approvals/rejections.
- Sends email notifications via Gmail to proposal submitters.
- Runs a cron job to automate the process at regular intervals.

## Prerequisites

Before you begin, ensure you have the following:

- Node.js installed (v14 or higher).
- A Google Cloud Project with the Google Sheets API and Gmail API enabled.
- A Google Sheet linked to a Google Form for collecting submissions.
- A Telex account with a configured webhook URL.
- A Gmail account for sending email notifications.

## Setup Instructions

1. **Clone the Repository**

    ```bash
    git clone https://github.com/thanks299/telex_integration
    cd telex_integration
    ```

2. **Install Dependencies**

    Install the required Node.js packages:

    ```bash
    npm install
    ```

3. **Configure Google Sheets API**

    - Go to the Google Cloud Console.
    - Create a new project or use an existing one.
    - Enable the Google Sheets API and Gmail API.
    - Create credentials (OAuth 2.0) and download the `credentials.json` file.
    - Place the `credentials.json` file in the root directory of the project.
    - Share your Google Sheet with the service account email from the credentials.

4. **Configure Telex Webhook**

    - Log in to your Telex account.
    - Create a channel and activate the desired integrations (e.g., Slack, Email).
    - Obtain the Webhook URL for the channel.
    - Update the `TELEX_WEBHOOK_URL` variable in the code with your webhook URL.

5. **Configure Gmail**

    - Update the transporter configuration in the code with your Gmail address and password.
    - If using 2FA, generate an App Password for your Gmail account and use it instead of your regular password.

6. **Set Up Approval Criteria**

    Modify the `isProposalApproved` function in the code to define your approval criteria. For example:

    ```javascript
    const isProposalApproved = (proposal) => {
      return proposal.budget <= 10000; // Example: Budget must be less than $10,000
    };
    ```

7. **Update Google Sheet Details**

    Update the following variables in the code with your Google Sheet details:

    - `spreadsheetId`: The ID of your Google Sheet.
    - `range`: The range of cells to fetch data from (e.g., `Sheet1!A2:E`).

## Running the Application

Start the server:

```bash
node app.js
```

The cron job will automatically run at the specified interval (default: every hour). Check the console logs for confirmation that submissions are being processed.

## Cron Job Schedule

The cron job is scheduled to run every hour by default. You can customize the schedule by modifying the cron expression in the `cron.schedule` function. For example:

- Every 5 minutes: `*/5 * * * *`
- Every day at midnight: `0 0 * * *`
- Every Monday at 8 AM: `0 8 * * 1`

## Environment Variables

To keep sensitive information secure, you can use environment variables. Create a `.env` file in the root directory and add the following:

```env
GOOGLE_CREDENTIALS_PATH=./credentials.json
TELEX_WEBHOOK_URL=your_telex_webhook_url
GMAIL_USER=your_gmail_address
GMAIL_PASSWORD=your_gmail_password
SPREADSHEET_ID=your_google_sheet_id
```

Update the code to use `process.env` to access these variables.

## Example Workflow

1. A user submits a proposal via the Google Form.
2. The submission is recorded in the Google Sheet.
3. The cron job fetches the submission, evaluates it, and sends notifications:
    - **Telex**: Notifies the team of new submissions and approvals/rejections.
    - **Gmail**: Sends an email to the submitter with the approval/rejection status.

## Troubleshooting

- **Google Sheets API Errors**: Ensure the `credentials.json` file is correct and the Google Sheet is shared with the service account.
- **Telex Notifications**: Verify the webhook URL is correct and the Telex channel is active.
- **Gmail Errors**: Check your Gmail credentials and ensure 2FA is configured correctly.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements.

## Contact

For questions or support, contact [Your Name] at [your-email@example.com].

This README provides a comprehensive guide to setting up and running your application. Let me know if you need further assistance!
