import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Resend } from "resend";
import rateLimit from "express-rate-limit";
import xss from "xss";
import { db, hashPassword } from "./server/db.js";

const app = express();
const PORT = 8000;
const JWT_SECRET = process.env.JWT_SECRET || "mehul_zapadiya_portfolio_jwt_secret_2026_super_secure";
const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "zapadiyamehul58@gmail.com";

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

    const sanitizedName = xss(name);
    const sanitizedEmail = xss(email);
    const sanitizedPhone = phone ? xss(phone) : "";
    const sanitizedSubject = subject ? xss(subject) : "";
    const sanitizedMessage = xss(message);

    const newMessage = db.createMessage({ 
      name: sanitizedName, 
      email: sanitizedEmail, 
      phone: sanitizedPhone, 
      subject: sanitizedSubject, 
      message: sanitizedMessage 
    });

    // Send emails in the background to not block the request
    (async () => {
      try {
        if (process.env.RESEND_API_KEY) {
          // Notification to admin
          await resend.emails.send({
            from: "Portfolio <onboarding@resend.dev>",
            to: ADMIN_EMAIL,
            subject: `New Contact Message from ${sanitizedName}`,
            text: `Name: ${sanitizedName}\nEmail: ${sanitizedEmail}\nPhone: ${sanitizedPhone}\nSubject: ${sanitizedSubject}\n\nMessage:\n${sanitizedMessage}`
          });
          
          // Confirmation to visitor
          await resend.emails.send({
            from: "Portfolio <onboarding@resend.dev>",
            to: sanitizedEmail,
            subject: "Thank you for contacting me",
            text: `Hi ${sanitizedName},\n\nThank you for reaching out. I have received your message and will get back to you soon.\n\nBest regards,\nMehul Zapadiya`
          });
        }
      } catch (err) {
        console.error("Email sending failed:", err);
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


// ==================== ADMIN PROTECTED API ROUTES ====================

// GET: Auth Me
app.get("/api/auth/me", authMiddleware, (req: any, res) => {
  res.json({ success: true, data: { email: req.user.email } });
});

// POST: Send a reply email in the background
app.post("/api/messages/send-reply", authMiddleware, async (req: any, res) => {
  try {
    const { messageId, body } = req.body;
    if (!messageId || !body) {
      return res.status(400).json({ success: false, error: "Missing required fields: messageId, body" });
    }

    const message = db.getMessage(Number(messageId));
    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found" });
    }
    
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "Portfolio <onboarding@resend.dev>",
        to: message.email,
        subject: `Re: Contact from ${message.name}`,
        text: body
      });
    } else {
      console.log(`\n=== MOCK EMAIL SENT ===\nTo: ${message.email}\nSubject: Re: Contact from ${message.name}\nBody: ${body}\n==================\n`);
    }

    const updatedMessage = db.addReplyToMessage(Number(messageId), body);
    res.json({ success: true, message: "Reply sent and saved successfully.", data: updatedMessage });
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
