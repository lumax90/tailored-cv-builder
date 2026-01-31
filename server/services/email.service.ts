import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@tailoredairesume.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const APP_NAME = 'TailoredAIResume';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('Resend API key not configured, skipping email');
        return { id: 'skipped', success: false };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text
        });

        if (error) {
            console.error('Resend email error:', error);
            throw new Error(error.message);
        }

        return { id: data?.id, success: true };
    } catch (error: any) {
        console.error('Failed to send email:', error);
        throw error;
    }
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(to: string, token: string, fullName?: string) {
    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" style="max-width: 500px; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding: 40px;">
                            <div style="text-align: center; margin-bottom: 32px;">
                                <div style="display: inline-block; width: 56px; height: 56px; background: linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7); border-radius: 14px; line-height: 56px; color: white; font-weight: bold; font-size: 18px;">TAR</div>
                                <h1 style="margin: 16px 0 0; font-size: 24px; color: #1f2937;">${APP_NAME}</h1>
                            </div>
                            <h2 style="font-size: 20px; color: #1f2937; margin-bottom: 16px;">Verify your email address</h2>
                            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                                Hi${fullName ? ` ${fullName}` : ''},<br><br>
                                Thanks for signing up! Please click the button below to verify your email address.
                            </p>
                            <a href="${verifyUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">Verify Email</a>
                            <p style="color: #9ca3af; font-size: 14px; margin-top: 24px;">This link expires in 24 hours.</p>
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
                            <p style="color: #9ca3af; font-size: 12px; text-align: center;">If you didn't create this account, ignore this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    return sendEmail({
        to,
        subject: `Verify your ${APP_NAME} account`,
        html,
        text: `Verify your email: ${verifyUrl}`
    });
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(to: string, name: string) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; color: #6B7280; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to CV Builder! 🎉</h1>
        </div>
        <div class="content">
            <p>Hi ${name || 'there'},</p>
            <p>Thanks for joining CV Builder! You're now ready to create AI-powered, tailored resumes that get results.</p>
            <h3>Getting Started:</h3>
            <ol>
                <li>Complete your <strong>Master Profile</strong> with your experience, skills, and education</li>
                <li>Paste a job description in the <strong>Job Analysis</strong> page</li>
                <li>Let AI tailor your resume to match the role perfectly</li>
                <li>Download your professional PDF resume</li>
            </ol>
            <a href="${process.env.FRONTEND_URL}/profile" class="button">Complete Your Profile →</a>
        </div>
        <div class="footer">
            <p>CV Builder - AI-Powered Resume Optimization</p>
        </div>
    </div>
</body>
</html>
    `;

    return sendEmail({
        to,
        subject: 'Welcome to CV Builder! 🎉',
        html,
        text: `Welcome to CV Builder, ${name || 'there'}! Start by completing your Master Profile at ${process.env.FRONTEND_URL}/profile`
    });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1F2937; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .warning { background: #FEF3C7; border: 1px solid #FCD34D; padding: 12px; border-radius: 6px; color: #92400E; margin-top: 20px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <div class="warning">
                ⚠️ This link expires in 1 hour. If you didn't request a password reset, please ignore this email.
            </div>
        </div>
    </div>
</body>
</html>
    `;

    return sendEmail({
        to,
        subject: 'Reset Your CV Builder Password',
        html,
        text: `Reset your password: ${resetUrl} (expires in 1 hour)`
    });
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmation(to: string, planName: string) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .badge { display: inline-block; background: #10B981; color: white; padding: 8px 16px; border-radius: 100px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Subscription Confirmed! ✅</h1>
        </div>
        <div class="content">
            <p>Your subscription to <span class="badge">${planName}</span> is now active!</p>
            <p>You now have access to all the features included in your plan. Start creating tailored CVs today!</p>
            <p>If you have any questions, reply to this email or contact our support team.</p>
        </div>
    </div>
</body>
</html>
    `;

    return sendEmail({
        to,
        subject: `Your ${planName} subscription is active! ✅`,
        html,
        text: `Your ${planName} subscription is now active. Start creating tailored CVs today!`
    });
}
