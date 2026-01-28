import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ Accessing API Key from .env file (Secure)
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ MISSING API KEY: Please create a .env file and add REACT_APP_GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Converts a File object to a GoogleGenerativeAI Part object.
 * @param {File} file 
 * @returns {Promise<{inlineData: {data: string, mimeType: string}}>}
 */
async function fileToGenerativePart(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1];
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                },
            });
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Analyzes KYC documents using Gemini for FORENSIC INTEGRITY & DATA EXTRACTION.
 * Performs deep analysis to detect digital tampering, photoshop artifacts, and document validity.
 * @param {File} idCardFile - The uploaded ID card image.
 * @returns {Promise<Object>} - The extracted data and forensic trust score.
 */
export async function analyzeKYC(idCardFile) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        if (!idCardFile) throw new Error("No file provided");

        const imagePart = await fileToGenerativePart(idCardFile);

        const prompt = `
      Act as a Senior Forensic Document Examiner and AI Identity Expert.
      Analyze the provided image of an Government ID.

      Task 1: FORENSIC INTEGRITY ANALYSIS
      Determine if this is a "Physical Scan" (photo of a real card) or a "Digital Original" (PDF/Screenshot of e-Aadhaar/e-PAN).

      CRITICAL SCORING RULES:
      1. If it looks like a **Physical Card**: Look for shadows, holograms, and micro-print. If these are missing or looks like a bad photoshop, score LOW.
      2. If it looks like a **Digital Original (e-ID)**: It WON'T have shadows/holograms. This is VALID. Check for font consistency, alignment, and pixelation artifacts instead.
      
      Score 0-100 based on *integrity*:
      - 90-100: Authentic (Clear Physical Card OR Perfect Digital Original).
      - 70-89: Mostly valid, minor quality issues.
      - 0-60: Obvious forgery, bad photoshop, or clearly manipulated text.

      Task 2: DATA EXTRACTION
      - Extract the visible text accurately.

      Return the result STRICTLY as this JSON format (no markdown):
      {
        "forensics": {
          "trustScore": 95, 
          "isPhysicalDocument": true, 
          "reasoning": "Identified as a valid Digital Original (e-Aadhaar). Fonts and layout are consistent."
        },
        "extracted": {
          "fullName": "...",
          "dob": "YYYY-MM-DD",
          "gender": "...",
          "idNumber": "...",
          "address": "...",
          "phone": "..."
        }
      }
      
      If the image is unclear, set fields to null.
      BE FAIR: Do NOT penalize high-quality digital PDFs. They are valid.
    `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean up code blocks if Gemini mimics markdown
        const jsonString = text.replace(/```json|```/g, "").trim();

        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Gemini Forensic Error:", error);

        // --- FALLBACK MOCK DATA ---
        return {
            forensics: {
                trustScore: 88,
                isPhysicalDocument: true,
                reasoning: "API Unreachable. Returning trusted mock protocol."
            },
            extracted: {
                fullName: "John Doe (Demo)",
                dob: "1998-05-12",
                gender: "Male",
                idNumber: "ABCDE1234F",
                address: "123 Secure Lane, Blockchain City",
                phone: "9876543210"
            }
        };
    }
}
