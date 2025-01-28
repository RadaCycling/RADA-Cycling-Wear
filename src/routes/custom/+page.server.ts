import { EMAIL, RECEIVER_EMAIL, WHATSAPP_TOKEN, WHATSAPP_ENDPOINT } from "$env/static/private";
import transporter from "$lib/email/rada.server";
import axios from "axios";
import type { Options } from "nodemailer/lib/mailer";

const sendEmail = async (message: Options) => {
    await new Promise((resolve, reject) => {
        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.log({ info });
                resolve(info);
            }
        });
    });
};

const sendWhatsApp = async (phone: string, firstName: string, lastName: string, teamName: string, teamSize: string, message: string) => {
    try {
        const response = await axios({
            url: WHATSAPP_ENDPOINT,
            method: 'post',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                "messaging_product": "whatsapp",
                "to": "16672730029",
                // "to": phone,
                "type": "template",
                "template": {
                    "name": "gear_request",
                    "language": { "code": "en_US" },
                    "components": {
                        "type": "body",
                        "parameters": [
                            {
                                "type": "text",
                                "text": firstName
                            },
                            {
                                "type": "text",
                                "text": lastName
                            },
                            {
                                "type": "text",
                                "text": teamName
                            },
                            {
                                "type": "text",
                                "text": teamSize
                            },
                            {
                                "type": "text",
                                "text": message
                            },
                        ]
                    }
                }
            })
        });
        console.log('WhatsApp message sent:', response.data);
    } catch (error) {
        throw new Error("Error sending WhatsApp message: " + (error as Error).message);
    }
};

export const actions = {
    default: async ({ request }) => {
        try {
            const formData = await request.formData();
            const firstName = formData.get("firstName") as string;
            const lastName = formData.get("lastName") as string;
            const teamName = formData.get("teamName") as string;
            const email = formData.get("email") as string;
            const phone = formData.get("phone") as string;
            const teamSize = formData.get("teamSize") as string;
            const messageContent = formData.get("message") as string;

            const contactMethod = formData.get("contactMethod") as string;

            const subject = `${firstName} ${lastName} - RADA Custom Inquiry`;

            // Building the email HTML content
            let html = `
                <div style="font-family: Arial, sans-serif; color: #333; font-size: 1rem; line-height: 1.6;">
                    <h1 style="font-size: 1.3rem; color: #f27931;">
                        RADA Custom Cycling Apparel
                    </h1>
                    <p style="font-size: inherit; color: inherit;">
                        <strong>First Name:</strong> ${firstName}
                    </p>
                    <p style="font-size: inherit; color: inherit;">
                        <strong>Last Name:</strong> ${lastName}
                    </p>
                    <p style="font-size: inherit; color: inherit;">
                        <strong>Team Name:</strong> ${teamName}
                    </p>
                    <p style="font-size: inherit; color: inherit;">
                        <strong>Email:</strong> ${email}
                    </p>
                    <p style="font-size: inherit; color: inherit;">
                        <strong>Phone:</strong> ${phone}
                    </p>
                    <p style="font-size: inherit; color: inherit;">
                        <strong>Team Size:</strong> ${teamSize}
                    </p>
                    <p style="font-size: inherit; color: inherit;">
                        <strong>Message:</strong><br/> ${messageContent || '<i style="display: inline-block;"> No message was added. </i>'}
                    </p>
                </div>
            `;

            const message = {
                from: EMAIL,
                to: email,
                bcc: RECEIVER_EMAIL,
                subject: subject,
                html: html,
            };

            if (contactMethod === "email") {
                console.log('sending email');
                // Send email
                await sendEmail(message);
            } else {
                // Send WhatsApp Message
                await sendWhatsApp(phone, firstName, lastName, teamName, teamSize, messageContent);
            }

            return {
                success: "Message sent successfully.",
            };

        } catch (error) {
            console.error(error);
            return {
                error: "There was an error sending the message.",
            };
        }
    },
};