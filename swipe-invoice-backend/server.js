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

const prompt =
  'Please process the uploaded data and extract the information with the following structure: - For **invoices**, return an array of objects with the following keys: - "serial_number" (string) - "customer_name" (string) - "product_name" (string) - "quantity" (number) - "total_amount" (number) - "date" (string) - For **products**, return an array of objects with the following keys: - "product_name" (string) - "quantity" (number) - "tax" (number) - "price_with_tax" (number) // Price including tax - "discount" (number or string) // Optional field, if available - For **customers**, return an array of objects with the following keys: - "customer_name" (string) - "phone_number" (string) - "total_purchase_amount" (number) The returned JSON should strictly follow this structure. Each field in the objects should be named exactly as shown above. ;const prompt = Please process the uploaded data and extract the information with the following structure: - For **invoices**, return an array of objects with the following keys: - "serial_number" (string) - "customer_name" (string) - "product_name" (string) - "quantity" (number) - "total_amount" (number) - "date" (string) - For **products**, return an array of objects with the following keys: - "product_name" (string) - "quantity" (number) - "tax" (number) - "price_with_tax" (number) // Price including tax - "discount" (number or string) // Optional field, if available - For **customers**, return an array of objects with the following keys: - "customer_name" (string) - "phone_number" (string) - "total_purchase_amount" (number) The returned JSON should strictly follow this structure. Each field in the objects should be named exactly as shown above.';
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

    // console.log("Uploaded File Details:", file); // debugging purpose

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
    else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      const XLSX = require("xlsx"); // Ensure XLSX is required

      // Read the workbook from the file
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      if (!sheet) {
        throw new Error("No valid sheet found in the Excel file.");
      }

      // Convert the sheet to JSON and filter out empty rows
      const rows = XLSX.utils
        .sheet_to_json(sheet, { header: 1 })
        .filter((row) =>
          row.some((cell) => cell !== undefined && cell !== null && cell !== "")
        );

      // console.log("Filtered XLSX Rows:", rows); // Debugging log

      // Remove empty cells in each row
      fileContent = rows
        .map((row) =>
          row
            .filter(
              (cell) => cell !== undefined && cell !== null && cell !== ""
            )
            .join(" ")
        )
        .join("\n");
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

    // console.log("Processed File Content:", fileContent); // debugging purpose

    const geminiApiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    const response = await axios.post(
      `${geminiApiUrl}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
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

    console.log(
      "Gemini API Full Response:",
      JSON.stringify(response.data, null, 2)
    ); // debugging purpose

    const structuredData = parseExtractedData(response.data);

    res.json({ structuredData });

    fs.unlinkSync(file.path); // Cleanup uploaded file
  } catch (error) {
    console.error(
      "Error Processing File:",
      error.response?.data || error.message
    );
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
function parseExtractedData(geminiResponse) {
  // Check if the response contains the expected candidates
  const candidates = geminiResponse.candidates || [];

  if (!candidates.length || !candidates[0]?.content?.parts) {
    console.error("Gemini API Response does not contain expected data.");
    return { invoices: [], products: [], customers: [] }; // Return empty data
  }

  try {
    // Extract the text part
    const textContent = candidates[0].content.parts[0]?.text || "";

    // Clean the text content to remove code block markers and ensure valid JSON
    const cleanJson = textContent
      .replace(/^```json\s*/g, "") // Remove the opening code block
      .replace(/\s*```$/g, "") // Remove the closing code block
      .trim() // Trim any remaining spaces or newlines
      .replace(/[^}]*$/, ""); // Remove any non-JSON content after the last closing brace

    // Log the cleaned content to check
    console.log("Cleaned JSON:", cleanJson);

    // Parse the cleaned JSON
    const parsedData = JSON.parse(cleanJson);

    // Ensure the structure matches your expected output
    return {
      invoices: parsedData.invoices || [],
      products: parsedData.products || [],
      customers: parsedData.customers || [],
    };
  } catch (error) {
    console.error("Error parsing Gemini API response:", error.message);
    return { invoices: [], products: [], customers: [] }; // Return empty data in case of error
  }
}
// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
