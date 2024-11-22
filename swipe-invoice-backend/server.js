const express = require("express");
const multer = require("multer"); // For handling file uploads
const axios = require("axios"); // For API calls
const fs = require("fs"); // To handle file streams
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const session = require("cookie-session");
const dotenv = require("dotenv");
const cors = require("cors");
const pdf = require("pdf-parse"); // PDF parsing library
const Tesseract = require("tesseract.js"); // OCR for images
const { parse } = require("xlsx"); // For XLSX processing
const csvParser = require("csv-parser"); // CSV parser

dotenv.config(); // Load environment variables

const app = express();

// Use cookie session to store user session data
app.use(
  session({
    name: "session",
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Set up CORS
app.use(cors());

// Configure multer to store uploaded files in "uploads/" temporarily
const upload = multer({ dest: "uploads/" });

// Google OAuth Strategy for login (if needed)
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3001/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Google OAuth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// Dashboard Route
app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Welcome, ${req.user.displayName}!`);
  } else {
    res.redirect("/");
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.logout(() => {});
  res.redirect("/");
});

// File Processing for Multiple Formats
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Uploaded File Details:", file); // debugging purpose

    let fileContent = "";
    const fileType = file.mimetype;

    // Handle CSV Files
    if (fileType === "text/csv") {
      const rows = [];
      const stream = fs.createReadStream(file.path).pipe(csvParser());
      for await (const row of stream) {
        rows.push(row);
      }
      fileContent = rows.map((row) => Object.values(row).join(" ")).join("\n");
    }
    // Handle XLSX Files
    else if (fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      const workbook = parse(fs.readFileSync(file.path));
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = parse(sheet, { header: 1 });
      fileContent = rows.map((row) => row.join(" ")).join("\n");
    }
    // Handle PDF Files
    else if (fileType === "application/pdf") {
      fileContent = await extractTextFromPDF(file.path);
    }
    // Handle Image Files (JPG, JPEG)
    else if (fileType.startsWith("image/")) {
      fileContent = await extractTextFromImage(file.path);
    } else {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    console.log("Processed File Content:", fileContent); // debugging purpose

    // Send file content to Gemini API
    const geminiApiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    const response = await axios.post(
      `${geminiApiUrl}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: fileContent,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Gemini API Full Response:", JSON.stringify(response.data, null, 2)); // debugging purpose

    // Parse and structure the data
    const structuredData = parseExtractedData(response.data);

    res.json({ structuredData });

    // Cleanup uploaded file
    fs.unlinkSync(file.path);
  } catch (error) {
    console.error("Error Processing File:", error.response?.data || error.message);
    res.status(500).json({
      message: "Error processing file",
      error: error.message,
    });
  }
});

// Helper function to extract text from PDF
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdf(dataBuffer);
  return pdfData.text; // Extracted text
}

// Helper function to extract text from images (using Tesseract OCR)
async function extractTextFromImage(filePath) {
  const { data } = await Tesseract.recognize(filePath, "eng");
  return data.text; // Extracted text
}

// Helper function to parse extracted data
function parseExtractedData(data) {
  const invoices = [];
  const products = [];
  const customers = [];

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("Invalid response structure from Gemini API");
  }

  const text = data.candidates[0].content.parts[0].text;
  if (!text) {
    throw new Error("No content text found in the response");
  }

  console.log("Extracted Text from API:", text); // Debugging

  // Example parsing logic for structured data
  const lines = text.split("\n");
  lines.forEach((line) => {
    const parts = line.split(" ");
    if (parts.length >= 6) {
      invoices.push({
        serialNumber: parts[0],
        customerName: parts[1] + " " + parts[2],
        productName: parts[3],
        quantity: parseInt(parts[4], 10),
        totalAmount: parseFloat(parts[5]),
        date: parts[6],
      });

      products.push({
        productName: parts[3],
        quantity: parseInt(parts[4], 10),
        unitPrice: parseFloat(parts[5]),
        totalPrice: parseFloat(parts[6]),
      });

      customers.push({
        customerName: parts[1] + " " + parts[2],
        totalPurchaseAmount: parseFloat(parts[5]),
      });
    }
  });

  return { invoices, products, customers };
}

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
