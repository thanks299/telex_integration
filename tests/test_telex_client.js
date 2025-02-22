const axios = require("axios");
const TelexClient = require("../src/telex_client");

jest.mock("axios");

describe("TelexClient", () => {
  let telexClient;

  beforeAll(() => {
    telexClient = new TelexClient("https://telex-webhook-url");
  });

  test("sends alert successfully", async () => {
    axios.post.mockResolvedValue({ data: "success" });
    const response = await telexClient.sendAlert({ text: "Test Alert" });
    expect(response).toBe("success");
  });

  test("throws error when alert fails", async () => {
    axios.post.mockRejectedValue(new Error("Failed to send alert"));
    await expect(telexClient.sendAlert({ text: "Test Alert" })).rejects.toThrow("Failed to send alert");
  });
});