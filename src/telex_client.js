const axios = require("axios");

class TelexClient {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  async sendAlert(event) {
    try {
      const response = await axios.post(this.webhookUrl, event);
      return response.data;
    } catch (err) {
      throw new Error(`Failed to send alert: ${err.message}`);
    }
  }
}

module.exports = TelexClient;