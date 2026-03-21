declare module "nodemailer" {
  export interface TransportOptions {
    host: string;
    port: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  }

  export interface SendMailOptions {
    from: string;
    to: string;
    subject: string;
    text: string;
    replyTo?: string;
  }

  export interface Transporter {
    sendMail(mailOptions: SendMailOptions): Promise<unknown>;
  }

  interface NodemailerModule {
    createTransport(options: TransportOptions): Transporter;
  }

  const nodemailer: NodemailerModule;
  export default nodemailer;
}
