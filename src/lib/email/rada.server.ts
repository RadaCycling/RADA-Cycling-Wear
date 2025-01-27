import nodemailer from 'nodemailer';
import { EMAIL, EMAIL_PASSWORD } from "$env/static/private";

const transporter = nodemailer.createTransport({
    host: 'gtxm1198.siteground.biz', // SiteGround's mail server
    port: 465, // SMTP Port for secure connections
    secure: true, // Use SSL/TLS
    auth: {
        user: EMAIL, // Your email address
        pass: EMAIL_PASSWORD // Your email password
    }
});

transporter.verify(function (error: any, success: any) {
    if (error) {
        console.error(error);
    }
});

export default transporter;