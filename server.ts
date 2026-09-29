import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import rateLimit from "express-rate-limit";
import xss from "xss";
import { db, hashPassword } from "./server/db.js";
import { Message } from "./src/types.js";

const app = express();
const PORT = 8000;
const JWT_SECRET = process.env.JWT_SECRET || "mehul_zapadiya_portfolio_jwt_secret_2026_super_secure";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "zapadiyamehul58@gmail.com";

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  return key ? new Resend(key) : null;
}

function getSmtpTransporter() {
  const user = process.env.SMTP_USER || process.env.ADMIN_EMAIL || "zapadiyamehul58@gmail.com";
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  if (!pass) return null;

  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });
}

// In-memory cache to prevent duplicate email sends on double-clicks or rapid retries
const recentRepliesCache = new Map<string, number>();
setInterval(() => {
  const now = Date.now();
  for (const [key, ts] of recentRepliesCache.entries()) {
    if (now - ts > 60000) {
      recentRepliesCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function sendUnifiedEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  fromName?: string;
}): Promise<{ success: boolean; provider: "resend" | "smtp"; messageId: string }> {
  const resend = getResendClient();
  const rawFrom = process.env.MAIL_FROM?.trim() || "Mehul Zapadiya <onboarding@resend.dev>";
  const fromName = options.fromName || "Mehul Zapadiya";
  const replyTo = options.replyTo || ADMIN_EMAIL;

  let resendErrorMessage = "";

  if (resend) {
    try {
      const result = await resend.emails.send({
        from: rawFrom,
        to: [options.to],
        reply_to: replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      if (!result.error && result.data?.id) {
        console.log(`[Resend Success] To: ${options.to}, Subject: "${options.subject}", ID: ${result.data.id}`);
        return {
          success: true,
          provider: "resend",
          messageId: result.data.id,
        };
      }

      resendErrorMessage = result.error?.message || "Resend failed to accept email";
      console.warn(`[Resend Warning] To: ${options.to}, Error: ${resendErrorMessage}`);
    } catch (err: any) {
      resendErrorMessage = err.message || String(err);
      console.warn(`[Resend Exception] To: ${options.to}, Error: ${resendErrorMessage}`);
    }
  }

  // Attempt SMTP fallback if configured
  const smtp = getSmtpTransporter();
  if (smtp) {
    try {
      const smtpUser = process.env.SMTP_USER || ADMIN_EMAIL;
      const smtpFrom = `"${fromName}" <${smtpUser}>`;
      const info = await smtp.sendMail({
        from: smtpFrom,
        to: options.to,
        replyTo: replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log(`[SMTP Success] To: ${options.to}, Subject: "${options.subject}", ID: ${info.messageId}`);
      return {
        success: true,
        provider: "smtp",
        messageId: info.messageId,
      };
    } catch (smtpErr: any) {
      console.error(`[SMTP Error] To: ${options.to}, Error:`, smtpErr);
      throw new Error(`Email delivery failed (SMTP: ${smtpErr.message || smtpErr}${resendErrorMessage ? `, Resend: ${resendErrorMessage}` : ''})`);
    }
  }

  if (resendErrorMessage) {
    throw new Error(resendErrorMessage);
  }

  throw new Error("No server email provider configured. Please configure RESEND_API_KEY (with verified domain in MAIL_FROM) or GMAIL_APP_PASSWORD.");
}

const messageRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: "Too many messages sent from this IP, please try again after 15 minutes." }
});

// Ensure upload directories exist
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.warn("Could not create uploads directory (expected in read-only environments like Vercel).");
  }
}

// Middleware
app.use(express.json({ limit: "50mb" })); // Increased limit for base64 file uploads

// Serve uploads statically
app.use("/uploads", express.static(UPLOADS_DIR));

// Helper: Custom JWT implementation for zero dependencies
function signToken(payload: { email: string; expiresAt: number }): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${data}`).digest("base64url");
  return `${header}.${data}.${signature}`;
}

function verifyToken(token: string): { email: string; expiresAt: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, data, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${data}`).digest("base64url");
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (Date.now() > payload.expiresAt) return null; // Expired
    return payload;
  } catch {
    return null;
  }
}

// Authentication Middleware
function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized: Missing token" });
  }
  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid or expired token" });
  }
  req.user = payload;
  next();
}

// ==================== PUBLIC API ROUTES ====================

// GET: Portfolio state aggregates (for faster single load)
app.get("/api/portfolio", (req, res) => {
  try {
    const profile = db.getProfile();
    const skills = db.getSkills();
    const projects = db.getProjects();
    const achievements = db.getAchievements();
    const education = db.getEducation();
    res.json({
      success: true,
      data: { profile, skills, projects, achievements, education }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Dynamic Sitemap (SEO)
app.get("/sitemap.xml", (req, res) => {
  try {
    const domain = "https://mehulzapadiya.com"; // User should replace with their production domain
    const blogs = db.getBlogs().filter(b => b.published);
    const projects = db.getProjects();
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Core Pages
    const pages = ["", "/blog", "/resume", "/#projects", "/#about", "/#skills"];
    pages.forEach(page => {
      xml += `  <url>\n    <loc>${domain}${page}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${page === "" ? "1.0" : "0.8"}</priority>\n  </url>\n`;
    });
    
    // Blogs
    blogs.forEach(blog => {
      xml += `  <url>\n    <loc>${domain}/blog/${blog.slug}</loc>\n    <lastmod>${new Date(blog.updated_at || blog.created_at).toISOString().split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Projects
    projects.forEach(project => {
      xml += `  <url>\n    <loc>${domain}/projects/${project.id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });
    
    xml += `</urlset>`;
    
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// GET: Profile
app.get("/api/profile", (req, res) => {
  try {
    res.json({ success: true, data: db.getProfile() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Skills
app.get("/api/skills", (req, res) => {
  try {
    res.json({ success: true, data: db.getSkills() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Projects
app.get("/api/projects", (req, res) => {
  try {
    res.json({ success: true, data: db.getProjects() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Achievements
app.get("/api/achievements", (req, res) => {
  try {
    res.json({ success: true, data: db.getAchievements() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Education
app.get("/api/education", (req, res) => {
  try {
    res.json({ success: true, data: db.getEducation() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST: Send a message from contact form
app.post("/api/messages", messageRateLimiter, async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "Missing required fields (name, email, message)" });
    }

    const sanitizedName = xss(name.trim());
    const sanitizedEmail = xss(email.trim());
    const sanitizedPhone = phone ? xss(phone.trim()) : "";
    const sanitizedSubject = subject ? xss(subject.trim()) : "";
    const sanitizedMessage = xss(message.trim());

    const newMessage = db.createMessage({ 
      name: sanitizedName, 
      email: sanitizedEmail, 
      phone: sanitizedPhone, 
      subject: sanitizedSubject, 
      message: sanitizedMessage 
    });

    const appUrl = (process.env.APP_URL || "https://mehul-zapadiya.vercel.app").replace(/\/$/, "");

    // Send emails in background so contact submission returns fast to the visitor
    (async () => {
      // 1. Notification email to Mehul (Admin)
      try {
        const adminEmailSubject = `New Portfolio Contact Message — ${sanitizedName}`;
        const adminEmailText = `New Portfolio Contact Message\n\n` +
          `Visitor Name: ${sanitizedName}\n` +
          `Visitor Email: ${sanitizedEmail}\n` +
          `${sanitizedPhone ? `Phone: ${sanitizedPhone}\n` : ""}` +
          `${sanitizedSubject ? `Subject: ${sanitizedSubject}\n` : ""}` +
          `Date & Time: ${new Date().toLocaleString()}\n\n` +
          `Message:\n${sanitizedMessage}\n\n` +
          `Open Admin Inbox:\n${appUrl}/admin`;

        const adminEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;background:#080812;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
            <div style="max-width:650px;margin:30px auto;background:#11111f;border:1px solid #29294a;border-radius:16px;overflow:hidden;">
              <div style="padding:24px 28px;background:linear-gradient(135deg,#1f1a3a,#11111f);border-bottom:1px solid #29294a;">
                <span style="display:inline-block;padding:4px 10px;background:#4f46e5;color:#ffffff;font-size:11px;font-weight:bold;border-radius:6px;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">New Submission</span>
                <h1 style="margin:0;font-size:22px;color:#ffffff;">New Contact Message — ${escapeHtml(sanitizedName)}</h1>
              </div>
              <div style="padding:28px;">
                <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px;color:#e9e9f5;">
                  <tr><td style="padding:8px 0;color:#8f8fa8;width:130px;"><strong>Visitor Name:</strong></td><td style="padding:8px 0;color:#ffffff;font-weight:600;">${escapeHtml(sanitizedName)}</td></tr>
                  <tr><td style="padding:8px 0;color:#8f8fa8;"><strong>Visitor Email:</strong></td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(sanitizedEmail)}" style="color:#60a5fa;text-decoration:none;">${escapeHtml(sanitizedEmail)}</a></td></tr>
                  ${sanitizedPhone ? `<tr><td style="padding:8px 0;color:#8f8fa8;"><strong>Phone:</strong></td><td style="padding:8px 0;color:#34d399;">${escapeHtml(sanitizedPhone)}</td></tr>` : ''}
                  ${sanitizedSubject ? `<tr><td style="padding:8px 0;color:#8f8fa8;"><strong>Subject:</strong></td><td style="padding:8px 0;color:#ffffff;">${escapeHtml(sanitizedSubject)}</td></tr>` : ''}
                  <tr><td style="padding:8px 0;color:#8f8fa8;"><strong>Date & Time:</strong></td><td style="padding:8px 0;color:#a5a5c0;">${new Date().toLocaleString()}</td></tr>
                </table>
                <div style="margin-bottom:24px;">
                  <span style="font-size:12px;font-weight:bold;color:#8f8fa8;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:8px;">Message Content:</span>
                  <div style="padding:18px;background:#19192b;border:1px solid #303052;border-radius:10px;color:#ffffff;font-size:14px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(sanitizedMessage)}</div>
                </div>
                <div style="margin-top:20px;">
                  <a href="${appUrl}/admin" style="display:inline-block;padding:12px 24px;border-radius:8px;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;">Open Admin Inbox</a>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        await sendUnifiedEmail({
          to: ADMIN_EMAIL,
          replyTo: sanitizedEmail,
          subject: adminEmailSubject,
          text: adminEmailText,
          html: adminEmailHtml,
        });
      } catch (err: any) {
        console.error("[Contact Form] Failed to send admin notification email:", err.message || err);
      }

      // 2. Auto-confirmation email to visitor
      try {
        const visitorSubject = "Thank you for contacting Mehul Zapadiya";
        const visitorText = `Hello ${sanitizedName},\n\nThank you for contacting Mehul Zapadiya.\n\nYour message has been successfully received.\n\nI will review your message and get back to you as soon as possible.\n\nRegards,\n\nMehul Zapadiya\nPython Developer | AI Engineer | Data Analytics Enthusiast | Full-Stack Web Developer\n\nPortfolio:\n${appUrl}`;
        const visitorHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;background:#080812;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
            <div style="max-width:650px;margin:30px auto;background:#11111f;border:1px solid #29294a;border-radius:16px;overflow:hidden;">
              <div style="padding:24px 28px;background:linear-gradient(135deg,#17172d,#11111f);border-bottom:1px solid #29294a;">
                <h1 style="margin:0;font-size:22px;color:#ffffff;">Mehul Zapadiya</h1>
                <p style="margin:6px 0 0;color:#a5a5c0;font-size:13px;">Python Developer · AI Engineer · Data Analytics Enthusiast · Full-Stack Web Developer</p>
              </div>
              <div style="padding:28px;">
                <p style="color:#ffffff;font-size:15px;margin-top:0;">Hello ${escapeHtml(sanitizedName)},</p>
                <div style="margin:18px 0;padding:18px;background:#19192b;border:1px solid #303052;border-radius:10px;color:#e9e9f5;font-size:14px;line-height:1.7;">
                  Thank you for contacting Mehul Zapadiya.<br><br>
                  Your message has been successfully received. I will review your message and get back to you as soon as possible.
                </div>
                <p style="margin-top:24px;color:#ffffff;line-height:1.6;font-size:14px;">
                  Regards,<br>
                  <strong>Mehul Zapadiya</strong><br>
                  <span style="color:#8f8fa8;font-size:13px;">Python Developer | AI Engineer | Data Analytics Enthusiast | Full-Stack Web Developer</span>
                </p>
                <div style="margin-top:20px;">
                  <a href="${appUrl}" style="display:inline-block;padding:11px 22px;border-radius:8px;background:#5b4bff;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">Visit Portfolio</a>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        await sendUnifiedEmail({
          to: sanitizedEmail,
          replyTo: ADMIN_EMAIL,
          subject: visitorSubject,
          text: visitorText,
          html: visitorHtml,
        });
      } catch (err: any) {
        console.warn("[Contact Form] Failed to send visitor confirmation email:", err.message || err);
      }
    })();

    res.json({ success: true, data: newMessage });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Blogs (Published only for public)
app.get("/api/blogs", (req, res) => {
  try {
    const blogs = db.getBlogs().filter(b => b.published);
    res.json({ success: true, data: blogs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Single Blog by Slug
app.get("/api/blogs/:slug", (req, res) => {
  try {
    const blog = db.getBlogBySlug(req.params.slug);
    if (!blog || !blog.published) {
      return res.status(404).json({ success: false, error: "Blog not found" });
    }
    res.json({ success: true, data: blog });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST: Auth Login
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const admin = db.getAdmin();
    const inputHash = hashPassword(password, admin.salt);

    if (email.toLowerCase() !== admin.email.toLowerCase() || inputHash !== admin.passwordHash) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    // Token expires in 12 hours
    const token = signToken({
      email: admin.email,
      expiresAt: Date.now() + 12 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        token,
        email: admin.email,
        expiresIn: 12 * 60 * 60
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendAdminReplyEmail({
  visitorName,
  visitorEmail,
  originalSubject,
  reply,
}: {
  visitorName: string;
  visitorEmail: string;
  originalSubject?: string;
  reply: string;
}): Promise<{ success: boolean; emailId: string; provider: string }> {
  if (!visitorEmail || !visitorEmail.trim()) {
    throw new Error("Visitor email is missing in the message record.");
  }

  const cleanSubject = originalSubject?.trim();
  const subject = cleanSubject
    ? (cleanSubject.toLowerCase().startsWith("re:") ? cleanSubject : `Re: ${cleanSubject}`)
    : "Reply from Mehul Zapadiya";

  const appUrl = (process.env.APP_URL || "https://mehul-zapadiya.vercel.app").replace(/\/$/, "");

  const textBody =
    `Hello ${visitorName},\n\n` +
    `${reply}\n\n` +
    `Thank you for contacting me. If you have any further questions, simply reply directly to this email.\n\n` +
    `Regards,\n` +
    `Mehul Zapadiya\n` +
    `Python Developer | AI Engineer | Data Analytics Enthusiast | Full-Stack Web Developer\n\n` +
    `Portfolio: ${appUrl}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#080812;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
      <div style="max-width:650px;margin:30px auto;background:#11111f;border:1px solid #29294a;border-radius:18px;overflow:hidden;">
        <div style="padding:28px;background:linear-gradient(135deg,#17172d,#11111f);border-bottom:1px solid #29294a;">
          <h1 style="margin:0;font-size:24px;color:#ffffff;">Mehul Zapadiya</h1>
          <p style="margin:8px 0 0;color:#a5a5c0;font-size:13px;">Python Developer · AI Engineer · Data Analytics Enthusiast · Full-Stack Web Developer</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#ffffff;font-size:16px;margin-top:0;">Hello ${escapeHtml(visitorName)},</p>
          <div style="margin:22px 0;padding:22px;background:#19192b;border:1px solid #303052;border-radius:12px;color:#e9e9f5;font-size:15px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(reply)}</div>
          <p style="color:#a5a5c0;line-height:1.6;font-size:14px;">
            Thank you for contacting me. If you have any further questions, simply reply directly to this email.
          </p>
          <p style="margin-top:28px;color:#ffffff;line-height:1.6;font-size:14px;">
            Regards,<br>
            <strong>Mehul Zapadiya</strong><br>
            <span style="color:#8f8fa8;font-size:13px;">Python Developer | AI Engineer | Data Analytics Enthusiast | Full-Stack Web Developer</span>
          </p>
          <div style="margin-top:20px;">
            <a href="${appUrl}" style="display:inline-block;padding:12px 22px;border-radius:8px;background:#5b4bff;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">Visit Portfolio</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendUnifiedEmail({
    to: visitorEmail.trim(),
    replyTo: ADMIN_EMAIL,
    subject,
    text: textBody,
    html: htmlBody,
  });

  return {
    success: true,
    emailId: result.messageId,
    provider: result.provider,
  };
}

// ==================== ADMIN PROTECTED API ROUTES ====================

// GET: Auth Me
app.get("/api/auth/me", authMiddleware, (req: any, res) => {
  res.json({ success: true, data: { email: req.user.email } });
});

// POST: Send admin reply email to visitor
app.post("/api/messages/send-reply", authMiddleware, async (req: any, res) => {
  try {
    const { messageId, body, replyIndex, clientReplyId } = req.body;
    if (!messageId || !body || !body.trim()) {
      return res.status(400).json({ success: false, error: "Missing required fields: messageId, body" });
    }

    // Duplicate submission protection (idempotency)
    const idempotencyKey = clientReplyId || `${messageId}:${body.trim()}`;
    const lastSentTimestamp = recentRepliesCache.get(idempotencyKey);
    if (lastSentTimestamp && Date.now() - lastSentTimestamp < 8000) {
      return res.status(429).json({
        success: false,
        error: "A reply with the same content is already being sent. Please wait a moment."
      });
    }
    recentRepliesCache.set(idempotencyKey, Date.now());

    const message = db.getMessage(Number(messageId));
    if (!message) {
      return res.status(404).json({ success: false, error: "Message record not found in database." });
    }

    if (!message.email || !message.email.trim()) {
      return res.status(400).json({ success: false, error: "Visitor email is missing from original message." });
    }

    try {
      console.log(`[Admin Reply] Sending reply to visitor: ${message.email} (Message ID: ${messageId})`);
      const emailResult = await sendAdminReplyEmail({
        visitorName: message.name,
        visitorEmail: message.email,
        originalSubject: message.subject,
        reply: body.trim(),
      });

      let updatedMessage: Message | undefined;
      const hasValidIndex = typeof replyIndex === "number" && replyIndex >= 0;

      if (hasValidIndex) {
        updatedMessage = db.updateReplyInMessage(Number(messageId), replyIndex, {
          body: body.trim(),
          emailStatus: "SENT",
          providerMessageId: emailResult.emailId || undefined,
          sentAt: new Date().toISOString(),
          emailError: undefined,
        });
      } else {
        updatedMessage = db.addReplyToMessage(Number(messageId), {
          body: body.trim(),
          emailStatus: "SENT",
          providerMessageId: emailResult.emailId || undefined,
          sentAt: new Date().toISOString()
        });
      }

      // Automatically mark message as read upon successful reply
      db.updateMessage(Number(messageId), { read: true });

      console.log(`[Admin Reply Success] Provider: ${emailResult.provider}, Message ID: ${emailResult.emailId}`);
      res.json({
        success: true,
        message: "Reply sent and delivered successfully to visitor's email.",
        data: updatedMessage,
        emailId: emailResult.emailId
      });
    } catch (emailError: any) {
      const errorMsg = emailError.message || String(emailError);
      console.error(`[Admin Reply Failed] To: ${message.email}, Error: ${errorMsg}`);

      let updatedMessage: Message | undefined;
      const hasValidIndex = typeof replyIndex === "number" && replyIndex >= 0;

      if (hasValidIndex) {
        updatedMessage = db.updateReplyInMessage(Number(messageId), replyIndex, {
          body: body.trim(),
          emailStatus: "FAILED",
          emailError: errorMsg,
          failedAt: new Date().toISOString(),
        });
      } else {
        updatedMessage = db.addReplyToMessage(Number(messageId), {
          body: body.trim(),
          emailStatus: "FAILED",
          emailError: errorMsg,
          failedAt: new Date().toISOString()
        });
      }

      return res.status(500).json({
        success: false,
        error: errorMsg || "Failed to send email to visitor.",
        data: updatedMessage
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT: Change Admin Password
app.put("/api/auth/change-password", authMiddleware, (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Current password and new password are required" });
    }

    const admin = db.getAdmin();
    const currentHash = hashPassword(currentPassword, admin.salt);

    if (currentHash !== admin.passwordHash) {
      return res.status(400).json({ success: false, error: "Incorrect current password" });
    }

    const newSalt = crypto.randomBytes(16).toString("hex");
    const newHash = hashPassword(newPassword, newSalt);

    db.updateAdminPassword(newHash, newSalt);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Dashboard Stats
app.get("/api/dashboard/stats", authMiddleware, (req, res) => {
  try {
    const projectsCount = db.getProjects().length;
    const skillsCount = db.getSkills().length;
    const achievementsCount = db.getAchievements().length;
    const unreadMessagesCount = db.getMessages().filter(m => !m.read).length;

    res.json({
      success: true,
      data: { projectsCount, skillsCount, achievementsCount, unreadMessagesCount }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT: Profile (Update)
app.put("/api/profile", authMiddleware, (req, res) => {
  try {
    const updated = db.updateProfile(req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST: Skill (Create)
app.post("/api/skills", authMiddleware, (req, res) => {
  try {
    const { name, category, show_in_hero, order } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, error: "Name and category are required" });
    }
    const created = db.createSkill({
      name,
      category,
      show_in_hero: !!show_in_hero,
      order: Number(order) || 0
    });
    res.json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT: Skill (Update)
app.put("/api/skills/:id", authMiddleware, (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = db.updateSkill(id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: "Skill not found" });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE: Skill (Delete)
app.delete("/api/skills/:id", authMiddleware, (req, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = db.deleteSkill(id);
    if (!deleted) return res.status(404).json({ success: false, error: "Skill not found" });
    res.json({ success: true, data: { id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST: Project (Create)
app.post("/api/projects", authMiddleware, (req, res) => {
  try {
    const { title, description, image_url, github_url, live_url, tech_stack, featured, order } = req.body;
    if (!title || !description || !github_url) {
      return res.status(400).json({ success: false, error: "Title, description, and GitHub URL are required" });
    }
    const created = db.createProject({
      title,
      description,
      image_url: image_url || "",
      github_url,
      live_url: live_url || "",
      tech_stack: Array.isArray(tech_stack) ? tech_stack : [],
      featured: !!featured,
      order: Number(order) || 0
    });
    res.json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT: Project (Update)
app.put("/api/projects/:id", authMiddleware, (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = db.updateProject(id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: "Project not found" });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE: Project (Delete)
app.delete("/api/projects/:id", authMiddleware, (req, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = db.deleteProject(id);
    if (!deleted) return res.status(404).json({ success: false, error: "Project not found" });
    res.json({ success: true, data: { id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST: Achievement (Create)
app.post("/api/achievements", authMiddleware, (req, res) => {
  try {
    const { title, link, image_url, icon, category, order } = req.body;
    if (!title || !link) {
      return res.status(400).json({ success: false, error: "Title and drive link are required" });
    }
    const created = db.createAchievement({
      title,
      link,
      image_url: image_url || "",
      icon: icon || "Award",
      category: category || "Certification",
      order: Number(order) || 0
    });
    res.json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT: Achievement (Update)
app.put("/api/achievements/:id", authMiddleware, (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = db.updateAchievement(id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: "Achievement not found" });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE: Achievement (Delete)
app.delete("/api/achievements/:id", authMiddleware, (req, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = db.deleteAchievement(id);
    if (!deleted) return res.status(404).json({ success: false, error: "Achievement not found" });
    res.json({ success: true, data: { id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST: Education (Create)
app.post("/api/education", authMiddleware, (req, res) => {
  try {
    const { institute, role, description, duration, order } = req.body;
    if (!institute || !role || !duration) {
      return res.status(400).json({ success: false, error: "Institute, role, and duration are required" });
    }
    const created = db.createEducation({
      institute,
      role,
      description: description || "",
      duration,
      order: Number(order) || 0
    });
    res.json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT: Education (Update)
app.put("/api/education/:id", authMiddleware, (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = db.updateEducation(id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: "Education not found" });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE: Education (Delete)
app.delete("/api/education/:id", authMiddleware, (req, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = db.deleteEducation(id);
    if (!deleted) return res.status(404).json({ success: false, error: "Education not found" });
    res.json({ success: true, data: { id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Contact Form Messages
app.get("/api/messages", authMiddleware, (req, res) => {
  try {
    res.json({ success: true, data: db.getMessages() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT: Mark Message as Read
app.put("/api/messages/:id", authMiddleware, (req, res) => {
  try {
    const id = Number(req.params.id);
    const updated = db.updateMessage(id, { read: req.body.read });
    if (!updated) return res.status(404).json({ success: false, error: "Message not found" });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE: Message (Delete)
app.delete("/api/messages/:id", authMiddleware, (req, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = db.deleteMessage(id);
    if (!deleted) return res.status(404).json({ success: false, error: "Message not found" });
    res.json({ success: true, data: { id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST: Upload File (handles images/documents uploaded as Base64 strings)
app.post("/api/upload", authMiddleware, (req, res) => {
  try {
    if (process.env.VERCEL) {
      return res.status(403).json({ 
        success: false, 
        error: "Vercel's filesystem is read-only. To add photos, please run the app locally, upload through the admin panel, and then push your changes to GitHub." 
      });
    }

    const { filename, base64Data } = req.body;
    if (!filename || !base64Data) {
      return res.status(400).json({ success: false, error: "filename and base64Data are required" });
    }

    // Clean up base64 string
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;

    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(base64Data, "base64");
    }

    // Generate unique filename to avoid collision
    const ext = path.extname(filename);
    const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueName = `${base}_${Date.now()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/${uniqueName}`;
    res.json({
      success: true,
      data: { url: relativeUrl }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ==================== VITE CLIENT & STATIC SERVICE MIDDLEWARE ====================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server locally, not on Vercel serverless
if (!process.env.VERCEL) {
  startServer();
}

export default app;
