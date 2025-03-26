import { json } from '@sveltejs/kit';
import { BREVO_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

// Interface for the request body
interface SmsRequest {
  recipient: string;
  message: string;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { recipient, message } = await request.json() as SmsRequest;
    
    if (!recipient || !message) {
      return json({ 
        success: false, 
        error: 'Recipient and message are required' 
      }, { status: 400 });
    }

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: 'Adminimize',
        recipient: recipient,
        content: message,
        type: 'transactional',
        unicodeEnabled: false
      })
    };

    const response = await fetch('https://api.brevo.com/v3/transactionalSMS/send', options);
    const result = await response.json();

    if (response.ok) {
      return json({ success: true, data: result });
    } else {
      console.error('Brevo API error:', result);
      return json({ 
        success: false, 
        error: result.message || 'Failed to send SMS' 
      }, { status: response.status });
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 