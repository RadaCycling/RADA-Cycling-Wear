import { EMAIL, RECEIVER_EMAIL, WHATSAPP_TOKEN, WHATSAPP_ENDPOINT } from "$env/static/private";
import transporter from "$lib/email/rada.server";
import axios from "axios";
import type { Options } from "nodemailer/lib/mailer";
import { db } from "$lib/firebase/rada";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

            // Add message to database
            try {
                const messageData = {
                    firstName,
                    lastName,
                    teamName,
                    email,
                    phone,
                    teamSize,
                    messageContent,
                    contactMethod,
                    userId: "",
                    timestamp: serverTimestamp()
                };

                await addDoc(collection(db, "messages"), messageData);
            } catch (error) {
                console.log(error)
            }

            const subject = `${firstName} ${lastName} - RADA Custom Inquiry`;

            // Building the email HTML content
            let html = `
                <div style="font-family: Arial, sans-serif; color: #333; font-size: 1rem; line-height: 1.6;">
                    <p>Hello ${firstName} ${lastName},</p>
                    <p>Thank you for reaching out to RADA and expressing interest in our custom design services for ${teamName}. We are thrilled to collaborate with you and create something unique for your team of ${teamSize} people. We have received your request and the following message from you:</p>
                    <p>“${messageContent || 'No message was added.'}”</p>
                    <p>Our design team will review this and be in touch shortly to guide you through the next steps and discuss any specific details you’d like to include.</p>
                    <p>If you have any questions or would like to share more ideas in the meantime, please feel free to reply to this message. We appreciate your patience and look forward to creating something special together!</p>
                    <p>Best regards,<br/>The RADA Team</p>
                </div>
            `;

            const message = {
                from: EMAIL,
                to: email,
                bcc: [RECEIVER_EMAIL, EMAIL, 'radacyclingwear@gmail.com'],
                subject: subject,
                html: html,
            };

            if (contactMethod === "email") {
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