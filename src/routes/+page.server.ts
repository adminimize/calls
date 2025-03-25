import { z } from 'zod';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/db';

// Define the email form schema
const emailSchema = z.object({
    email: z.string().email('Please enter a valid email address')
});

// Define the verification code form schema
const verificationSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    code: z.string().min(1, 'Verification code is required')
});

export const load = async () => {
    // Initialize both forms
    const emailForm = await superValidate(zod(emailSchema));
    const verificationForm = await superValidate(zod(verificationSchema));

    return { emailForm, verificationForm };
};

export const actions = {
    sendCode: async ({ request }) => {
        const form = await superValidate(request, zod(emailSchema));
        
        if (!form.valid) {
            return fail(400, { form });
        }

        try {
            await db.auth.sendMagicCode({ email: form.data.email });
            return { form, success: true };
        } catch (err) {
            return message(form, 'Failed to send verification code. Please try again.', { status: 'error' });
        }
    },

    verifyCode: async ({ request }) => {
        const form = await superValidate(request, zod(verificationSchema));
        
        if (!form.valid) {
            return fail(400, { form });
        }

        try {
            await db.auth.signInWithMagicCode({ 
                email: form.data.email, 
                code: form.data.code 
            });
            return { form, success: true };
        } catch (err) {
            return message(form, 'Invalid verification code. Please try again.', { status: 'error' });
        }
    }
}; 