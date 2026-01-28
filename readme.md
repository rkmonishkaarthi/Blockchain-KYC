# 🛡️ Blockchain KYC Verification System

**Secure, Immutable, and AI-Powered Identity Verification on Ethereum.**

## 📌 Project Overview
This project is a decentralized application (DApp) designed to streamline **Know Your Customer (KYC)** processes for banks and organizations. It combines **Gemini AI** for instant identity extraction and face matching with the **Ethereum Blockchain** for tamper-proof record keeping.

## 🚀 Key Features

### 1. **AI-Powered Identity Analysis (Gemini)**
   - **Smart OCR:** Automatically extracts Name, DOB, and ID Numbers from Aadhaar/PAN cards.
   - **Face Match:** Compares the ID photo with a live selfie to detect fraud (Similarity Score).
   - **Tamper Detection:** AI scans for photoshop artifacts.

### 2. **Immutable KYC Records**
   - Verified identities are hashed using **SHA-256**.
   - The record is permanently sealed on the **Ethereum Blockchain**.
   - Ensures that once a user is KYC-verified, the status is global and unchangeable.

### 3. **Holographic Smart ID Card**
   - Generates a dynamic, verified **Digital KYC Card**.
   - Features a **Holographic Overlay** and **Mouse-responsive Glare** effects.
   - Embeds a real-time **QR Code** linking to the blockchain proof.

### 4. **Instant Status Check**
   - **Drag & Drop** any ID document to check its KYC status.
   - The system re-hashes the file and queries the smart contract.
   - **Result:** Displays "KYC VERIFIED" or "UNKNOWN".

## 🛠️ Technology Stack

-   **Frontend:** React.js (v18+)
-   **AI:** Google Gemini 1.5 Flash (via API)
-   **Blockchain:** Hardhat (Local Ethereum Network)
-   **Smart Contract:** Solidity (v0.8.0)
-   **Libraries:** `ethers.js`, `jspdf`, `qrcode.react`

## 📖 How to Use

### 1. KYC Registration (Customer/Agent)
1.  Navigate to the **"KYC Registration"** page.
2.  **Upload ID:** Select an Aadhaar or PAN card.
3.  **AI Auto-Verify:** Click "Auto-Verify ID". Gemini will extract details and match the selfie.
4.  **Capture Selfie:** Use the webcam for biometric proof.
5.  **Seal on Blockchain:** Confirm and sign the transaction.

### 2. Verify Customer (Banker/Admin)
1.  Navigate to the **"Check KYC Status"** page.
2.  **Drag & Drop** the customer's ID file.
3.  The system calculates the hash and checks the blockchain ledger.
4.  **Success:** The Holographic KYC Card appears.

## 🔧 Setup & Installation

1.  **Configure AI:**
    - Get a [Google Gemini API Key](https://aistudio.google.com/app/apikey).
    - Paste it in `frontend/src/utils/geminiAI.js`.

2.  **Start Local Blockchain:**
    ```bash
    npx hardhat node
    ```
3.  **Deploy Contract:**
    ```bash
    npx hardhat run scripts/deploy.js --network localhost
    ```
4.  **Start Frontend:**
    ```bash
    cd frontend
    npm start
    ```