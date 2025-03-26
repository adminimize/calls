# SMS Functionality with Brevo API

This feature allows sending SMS messages to crew members directly from the dashboard using the Brevo API.

## Setup

1. Sign up for a Brevo account at [https://www.brevo.com/](https://www.brevo.com/)
2. Get your API key from the Brevo dashboard
3. Add the API key to your `.env` file:

```
BREVO_API_KEY=your_brevo_api_key_here
```

## How It Works

The SMS functionality consists of two main parts:

1. **Server-side API Endpoint**: Located at `src/routes/api/sms/+server.ts`, this endpoint handles the secure communication with Brevo's API
2. **Client-side UI**: A modal form in the dashboard for users to input phone numbers and message content

## Usage

1. Click the "Send SMS" button on the dashboard
2. Enter the recipient's phone number (including country code, e.g., +1XXXXXXXXXX)
3. Type your message (limited to 160 characters)
4. Click "Send SMS"

## Technical Details

- The Brevo API expects phone numbers in international format (with country code)
- Messages are limited to 160 characters for standard SMS
- The API is configured to send transactional SMS rather than marketing messages
- All API calls are made server-side to keep your API key secure

## Troubleshooting

If you encounter issues sending SMS messages:

1. Verify your Brevo API key is correct
2. Ensure the recipient phone number is in international format
3. Check the server logs for detailed error messages
4. Verify your Brevo account has sufficient credits for sending SMS

## Future Improvements

- Add ability to send to multiple recipients
- Create templates for common messages
- Add scheduled SMS sending
- Integrate with call sheets to automatically notify relevant crew 