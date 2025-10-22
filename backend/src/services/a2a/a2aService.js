const axios = require('axios');

class A2AService {
    constructor() {
        this.clientId = process.env.A2A_CLIENT_ID;
        this.clientSecret = process.env.A2A_CLIENT_SECRET;
        this.authUrl = process.env.A2A_AUTH_URL;
    }

    async authenticate(credentials) {
        try {
            const response = await axios.post(`${this.authUrl}/token`, {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'client_credentials',
                ...credentials
            });

            return {
                access_token: response.data.access_token,
                token_type: response.data.token_type,
                expires_in: response.data.expires_in
            };
        } catch (error) {
            throw new Error(`A2A authentication failed: ${error.message}`);
        }
    }

    async refreshToken(tokenData) {
        // Token refresh logic
        return { access_token: 'new_token', expires_in: 3600 };
    }
}

module.exports = new A2AService();
