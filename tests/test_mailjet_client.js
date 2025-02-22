const MailjetClient = require("../src/mailjet_client");

describe("MailjetClient", () => {
  let mailjetClient;

  beforeAll(() => {
    mailjetClient = new MailjetClient("test_api_key", "test_secret_key");
  });

  test("sends email successfully", async () => {
    const info = await mailjetClient.sendEmail("recipient@example.com", "Test Subject", "Test Body");
    expect(info).toBeDefined();
  });

  test("throws error when email fails", async () => {
    await expect(mailjetClient.sendEmail("invalid", "Test Subject", "Test Body")).rejects.toThrow("Failed to send email");
  });
});