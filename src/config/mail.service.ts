// import nodemailer from "nodemailer";
// import path from "path";
// import fs from "fs";
// import handlebars from "handlebars";
// import Mail from "nodemailer/lib/mailer";
// import { subjectMap } from "~/shared/constraint/email";

// interface ISendMail {
//   subject: string;
//   to: string | string[];
//   data: {
//     [key: string]: string;
//   };
//   templateName: string;
//   attachments?: Mail.Attachment[];
// }

// export class MailService {
//   async getConfigNodeMailer() {
//     const transporter = nodemailer.createTransport({
//       transport: {
//         host: "smtp.gmail.com",
//         port: 587,
//         secure: false,
//         auth: {
//           user: process.env.EMAIL_USERNAME,
//           pass: process.env.EMAIL_PASSWORD,
//         },
//       },
//     });

//     return transporter;
//   }

//   async sendMail({
//     subject,
//     to,
//     templateName,
//     data,
//     attachments = [],
//   }: ISendMail) {
//     if (process.env.DISABLE_EMAIL === "true") {
//       console.log("Email sending is disabled");
//       return false;
//     }

//     const transporter = await this.getConfigNodeMailer();

//     const __dirname = path.resolve();
//     const isProd = process.env.NODE_ENV === "production";

//     const root = isProd || !process.env.NODE_ENV ? "dist" : "src";

//     const baseFilePath = path.join(
//       __dirname,
//       root,
//       "templates",
//       "base-template.html",
//     );

//     const filePath = path.join(
//       __dirname,
//       root,
//       "templates",
//       `${templateName}.html`,
//     );

//     const source = fs.readFileSync(filePath, "utf-8").toString();

//     const template = handlebars.compile(source);

//     const htmlToSend = template(data);

//     const baseSource = fs.readFileSync(baseFilePath, "utf-8").toString();

//     const baseTemplate = handlebars.compile(baseSource, {});

//     const baseHtml = baseTemplate({ content: htmlToSend });

//     await transporter.sendMail({
//       subject: subject,
//       sender: "Support Tool System",
//       from: {
//         name: "Support Tool System",
//         address: `<${process.env.GOOGLE_EMAIL}>`,
//       },
//       to,
//       html: baseHtml,
//     });

//     return true;
//   }

//   async sendMailMsg(payload: any) {
//     const getSubject = (templateName: any) => {
//       return (
//         subjectMap[templateName] ||
//         payload.subject ||
//         "MORE Cashback Support Tool!"
//       );
//     };
//     if (!payload.template || !payload.to) {
//       return false;
//     }

//     await this.sendMail({
//       subject: payload?.subject || getSubject(payload.template),
//       to: payload.to,
//       templateName: payload.template,
//       data: payload.data || {},
//     });

//     return true;
//   }
// }
