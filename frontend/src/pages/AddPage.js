import React, { useState } from "react";
import { analyzeKYC } from "../utils/geminiAI";
import { ethers } from "ethers";
import DocVerify from "../contracts/DocVerify.json";
import { QRCodeCanvas } from "qrcode.react";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const hardhatChainId = "0x7A69";

function AddPage() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    physicalAddress: "",
    phone: "",
    email: "",
    aadhaar: "",
    pan: "",
    passport: "",
    drivingLicense: "",
    voterId: "",
  });

  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };



  // --- LOGIC ---
  // --- LOGIC ---
  // --- KYC FORENSICS LOGIC ---
  const [trustScore, setTrustScore] = useState(null);
  const [forensicData, setForensicData] = useState(null);

  const processKYC = async (uploadedFile) => {
    if (!uploadedFile) return;
    setIsScanning(true);
    setStatus("Running Forensic Analysis...");

    try {
      // Forensics only - no selfie needed for this step
      const result = await analyzeKYC(uploadedFile);
      console.log("Forensic Result:", result);

      setForensicData(result.forensics);
      setTrustScore(result.forensics?.trustScore || 0);

      // Auto-fill form from extracted data
      const data = result.extracted || {};

      if (data.fullName) updateField('fullName', data.fullName);
      if (data.dob) updateField('dob', data.dob);
      if (data.gender) {
        const g = data.gender.toUpperCase();
        if (g.includes("FEMALE")) updateField('gender', "Female");
        else if (g.includes("MALE")) updateField('gender', "Male");
        else updateField('gender', "Other");
      }
      if (data.phone) updateField('phone', data.phone);

      if (data.idNumber) {
        const cleanId = data.idNumber.replace(/\s/g, '');
        if (/^\d{12}$/.test(cleanId)) updateField('aadhaar', cleanId);
        else if (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanId)) updateField('pan', cleanId);
        else updateField('aadhaar', data.idNumber);
      }
      if (data.address) updateField('physicalAddress', data.address);

      setStatus("Analysis Complete!");

    } catch (err) {
      console.error("KYC Error:", err);
      alert("AI Analysis Failed: " + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  // --- EFFECT: Smart Progress Simulation ---
  React.useEffect(() => {
    let interval;
    if (isScanning) {
      setOcrProgress(0);
      interval = setInterval(() => {
        setOcrProgress((prev) => {
          // Calibrated for ~25 seconds (125 ticks @ 200ms)
          // Avg increment needed: ~0.8% per tick
          // Range: 0.5% to 1.1%
          if (prev < 98) {
            return prev + Math.random() * 0.6 + 0.5;
          }
          return prev;
        });
      }, 200); // Update every 200ms
    } else {
      setOcrProgress(100); // finish line
    }
    return () => clearInterval(interval);
  }, [isScanning]);


  const getFileHash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return (
      "0x" +
      Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    );
  };

  const switchToLocalhost = async () => {
    if (!window.ethereum) return false;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hardhatChainId }],
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleUpload = async () => {
    if (!file || !fileHash) return;

    try {
      setLoading(true);
      setStatus("Requesting Signature...");

      const ok = await switchToLocalhost();
      if (!ok) {
        alert("Wallet connection failed. Please ensure MetaMask is installed and try again.");
        setStatus("Wallet not found");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(contractAddress, DocVerify.abi, signer);

      setStatus("Sealing on Blockchain...");
      const tx = await contract.addDocumentHash(
        fileHash,
        [
          formData.fullName,
          formData.dob,
          formData.gender,
          formData.physicalAddress,
          formData.phone,
          formData.email,
          formData.aadhaar,
          formData.pan,
          formData.passport,
          formData.drivingLicense,
          formData.voterId,
          formData.photoUrl || ""
        ]
      );

      await tx.wait();
      setStatus("Success!");
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      setStatus("Transaction Failed");
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const styles = {
    container: {
      maxWidth: "900px",
      margin: "40px auto",
      padding: "0 20px",
      fontFamily: "'Inter', sans-serif",
    },
    stepper: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "50px",
      position: "relative",
      padding: "0 20px",
    },
    step: (active) => ({
      position: "relative",
      zIndex: 2,
      background: active ? "var(--accent-blue)" : "#334155",
      color: active ? "white" : "#94a3b8",
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: "18px",
      transition: "all 0.3s",
      boxShadow: active ? "0 4px 12px rgba(59, 130, 246, 0.5)" : "none",
      border: active ? "none" : "2px solid #475569",
    }),
    stepLabel: (active) => ({
      position: "absolute",
      top: "60px",
      left: "50%",
      transform: "translateX(-50%)",
      fontSize: "13px",
      fontWeight: active ? "700" : "500",
      color: active ? "var(--accent-blue)" : "#94a3b8",
      width: "120px",
      textAlign: "center",
      transition: "all 0.3s",
      letterSpacing: "0.3px",
    }),
    line: {
      position: "absolute",
      top: "24px",
      left: "50px",
      right: "50px",
      height: "2px",
      background: "#334155",
      zIndex: 1,
      borderRadius: "4px",
    },
    lineProgress: {
      position: "absolute",
      top: "24px",
      left: "50px",
      lineProgress: {
        position: "absolute",
        top: "24px",
        left: "50px",
        width: `${((step - 1) / 4) * 100}%`, // 5 steps means 4 segments
        maxWidth: "calc(100% - 100px)",
        height: "2px",
        background: "var(--accent-blue)",
        zIndex: 1,
        transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        borderRadius: "4px",
      },
      zIndex: 1,
      transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      borderRadius: "4px",
    },
    card: {
      background: "var(--bg-card)",
      borderRadius: "24px",
      padding: "40px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      border: "1px solid #334155",
      color: "var(--text-primary)",
    },
    title: {
      fontSize: "26px",
      fontWeight: "700",
      marginBottom: "10px",
      color: "var(--text-primary)",
    },
    subtitle: {
      color: "#94a3b8",
      marginBottom: "30px",
      fontSize: "14px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px",
    },
    inputGroup: {
      marginBottom: "20px",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontSize: "13px",
      fontWeight: "600",
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    input: {
      width: "100%",
      padding: "14px",
      borderRadius: "12px",
      border: "1px solid #475569",
      fontSize: "15px",
      outline: "none",
      transition: "all 0.2s",
      background: "#0f172a", // Darker input bg
      color: "white",
      boxSizing: "border-box", // Fix width calculation
    },
    sectionHeader: {
      fontSize: "14px",
      fontWeight: "700",
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.8px",
      marginTop: "24px",
      marginBottom: "12px",
      paddingBottom: "8px",
      borderBottom: "2px solid #334155",
    },
    btnContainer: {
      marginTop: "50px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: "20px",
      borderTop: "1px solid #334155",
    },
    btn: (primary) => ({
      padding: "14px 32px",
      borderRadius: "12px",
      border: "none",
      fontWeight: "600",
      cursor: "pointer",
      background: primary ? "var(--accent-blue)" : "transparent",
      color: primary ? "white" : "#94a3b8",
      transition: "all 0.2s",
      fontSize: "15px",
      boxShadow: primary ? "0 4px 12px rgba(59, 130, 246, 0.3)" : "none",
    }),
    uploadZone: {
      border: "2px dashed #475569",
      borderRadius: "20px",
      padding: "80px 40px",
      textAlign: "center",
      cursor: "pointer",
      background: "#0f172a",
      transition: "all 0.2s",
    },
    summaryItem: {
      display: "flex",
      justifyContent: "space-between",
      padding: "16px 0",
      borderBottom: "1px solid #334155",
      alignItems: "center",
      color: "var(--text-primary)",
    },
    fadeIn: {
      animation: "fadeIn 0.5s ease",
    }
  };

  // --- RENDER STEPS ---

  // STEP 1: Basic Identity
  const renderStep1 = () => (
    <div style={styles.fadeIn}>
      <h2 style={styles.title}>KYC Registration Form</h2>
      <p style={styles.subtitle}>Enter Customer details or auto-fill using AI.</p>

      {/* KYC AI FORENSICS Section */}
      <div className={isScanning ? "scan-container" : ""} style={{ marginBottom: "30px", padding: "20px", background: "rgba(59, 130, 246, 0.05)", borderRadius: "16px", border: "1px dashed var(--accent-blue)", transition: "all 0.3s" }}>

        {/* Header / Titles */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", marginBottom: (trustScore) ? "20px" : "0" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontSize: '28px' }}>{isScanning ? "🕵️‍♂️" : "🔎"}</div>
            <div>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: 'white' }}>
                {isScanning ? `Forensic AI is Analyzing...` : "AI Document Forensics"}
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                {isScanning ? "Checking pixel integrity & extracting data..." : "Detects forgeries, photoshop edits & extracts data."}
              </p>
            </div>
          </div>

          {/* Upload Button */}
          {!isScanning && !trustScore && (
            <>
              <input
                type="file"
                id="kyc-upload"
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files[0]) processKYC(e.target.files[0]);
                }}
              />
              <button
                onClick={() => document.getElementById('kyc-upload').click()}
                style={{ ...styles.btn(true), padding: '10px 20px', fontSize: '13px' }}
              >
                Upload & Analyze
              </button>
            </>
          )}
        </div>

        {/* Scanning Animation Overlay */}
        {isScanning && (
          <div style={{ marginTop: "20px", height: "4px", background: "#334155", borderRadius: "2px", overflow: "hidden", position: "relative" }}>
            <div style={{
              position: "absolute",
              left: 0, top: 0, bottom: 0,
              width: `${ocrProgress}%`,
              background: "var(--accent-blue)",
              transition: "width 0.2s linear"
            }} />
          </div>
        )}

        {/* TRUST SCORE RESULT */}
        {trustScore !== null && !isScanning && (
          <div style={styles.fadeIn}>
            <div style={{ marginTop: "20px", padding: "15px", background: "#0f172a", borderRadius: "12px", border: trustScore > 85 ? "1px solid #10b981" : "1px solid #ef4444" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "12px", textTransform: "uppercase", color: "#94a3b8", fontWeight: "600" }}>Trust Score</span>
                <span style={{
                  fontSize: "20px",
                  fontWeight: "800",
                  color: trustScore > 85 ? "#10b981" : "#ef4444"
                }}>
                  {trustScore}% {trustScore > 85 ? "AUTHENTIC" : "SUSPICIOUS"}
                </span>
              </div>

              <div style={{ width: "100%", height: "8px", background: "#334155", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
                <div style={{
                  width: `${trustScore}%`,
                  height: "100%",
                  background: trustScore > 85 ? "#10b981" : "#ef4444",
                  transition: "width 1s ease-out"
                }} />
              </div>

              <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5" }}>
                {forensicData?.reasoning}
              </div>
            </div>

            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <button
                onClick={() => { setTrustScore(null); setForensicData(null); }}
                style={{ ...styles.btn(false), fontSize: "12px", padding: "5px 10px" }}
              >
                Analyze Another
              </button>
            </div>
          </div>
        )}

      </div>


      <div style={styles.grid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name *</label>
          <input
            style={styles.input}
            value={formData.fullName}
            onChange={e => updateField('fullName', e.target.value)}
            placeholder="e.g. John Doe"
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Date of Birth *</label>
          <input
            type="date"
            style={styles.input}
            value={formData.dob}
            max={new Date().toISOString().split("T")[0]}
            onChange={e => updateField('dob', e.target.value)}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Gender</label>
          <select
            style={styles.input}
            value={formData.gender}
            onChange={e => updateField('gender', e.target.value)}
          >
            <option value="">Select Gender...</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Phone Number *</label>
          <input
            style={styles.input}
            value={formData.phone}
            onChange={e => updateField('phone', e.target.value)}
            placeholder="+91 ..."
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Aadhaar Number</label>
          <input
            style={styles.input}
            value={formData.aadhaar}
            onChange={e => updateField('aadhaar', e.target.value)}
            placeholder="1234 5678 9012"
          />
        </div>
      </div>
      <div style={styles.inputGroup}>
        <label style={styles.label}>Physical Address</label>
        <textarea
          style={{ ...styles.input, height: "100px", resize: "none" }}
          value={formData.physicalAddress}
          onChange={e => updateField('physicalAddress', e.target.value)}
          placeholder="Complete permanent address..."
        />
      </div>
    </div>
  );

  // STEP 2: Govt IDs
  const renderStep2 = () => (
    <div style={styles.fadeIn}>
      <h2 style={styles.title}>Government ID</h2>
      <p style={styles.subtitle}>Add official identification numbers.</p>

      <div style={styles.grid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>PAN Card</label>
          <input
            style={styles.input}
            value={formData.pan}
            onChange={e => updateField('pan', e.target.value)}
            placeholder="ABCDE1234F"
          />
        </div>

      </div>
    </div>
  );



  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = React.useRef(null);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      alert("Unable to access camera");
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 480 * (video.videoHeight / video.videoWidth); // Maintain aspect ratio
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Circular crop (optional visual, but we keep full image for data) or just keep rect.
    // Let's keep rect for now, simpler. Use Base64.
    const photoUrl = canvas.toDataURL("image/jpeg", 0.8);
    updateField("photoUrl", photoUrl);

    // Stop stream
    const stream = video.srcObject;
    if (stream) stream.getTracks().forEach(t => t.stop());
    setIsCameraOpen(false);
  };

  // STEP 3: Biometric Capture
  const renderStep3 = () => (
    <div style={styles.fadeIn}>
      <h2 style={styles.title}>Biometric Photo</h2>
      <p style={styles.subtitle}>Capture a live photo for the Smart ID.</p>

      <div style={{ textAlign: "center", background: "#0f172a", padding: "30px", borderRadius: "20px", border: "1px solid #334155" }}>

        {formData.photoUrl ? (
          <div style={{ marginBottom: "20px" }}>
            <img
              src={formData.photoUrl}
              alt="Captured"
              style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "12px", border: "2px solid var(--accent-blue)" }}
            />
            <div style={{ marginTop: "15px" }}>
              <button onClick={() => updateField("photoUrl", "")} style={{ ...styles.btn(false), fontSize: "12px" }}>
                Retake Photo
              </button>
            </div>
          </div>
        ) : (
          <div>
            {isCameraOpen ? (
              <div style={{ marginBottom: "20px" }}>
                <video ref={videoRef} autoPlay style={{ width: "100%", maxWidth: "400px", borderRadius: "12px", border: "2px solid var(--accent-blue)" }} />
                <div style={{ marginTop: "15px" }}>
                  <button onClick={capturePhoto} style={styles.btn(true)}>
                    📸 Capture
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: "40px" }}>
                <div style={{ fontSize: "40px", marginBottom: "20px" }}>👤</div>
                <button onClick={startCamera} style={styles.btn(true)}>
                  Start Camera
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // STEP 4: Asset
  const renderStep4 = () => (
    <div style={styles.fadeIn}>
      <h2 style={styles.title}>Upload ID Document</h2>
      <p style={styles.subtitle}>Upload the primary document for hashing.</p>

      <div
        style={styles.uploadZone}
        onClick={() => document.getElementById('fileUpload').click()}
      >
        <div style={{ fontSize: "48px", marginBottom: "20px", opacity: 0.8 }}>📂</div>
        <h3 style={{ fontSize: "18px", color: "#334155", marginBottom: "10px" }}>
          Click to Upload Document
        </h3>
        <p style={{ marginBottom: "20px", color: "#64748b" }}>
          PDF, JPG, PNG or Excel files supported
        </p>
        <input
          id="fileUpload"
          type="file"
          style={{ display: "none" }}
          onChange={async (e) => {
            if (e.target.files[0]) {
              setFile(e.target.files[0]);
              const h = await getFileHash(e.target.files[0]);
              setFileHash(h);
            }
          }}
        />
      </div>

      {file && (
        <div style={{ marginTop: "20px", padding: "20px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#10b981", display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ fontSize: "24px" }}>📄</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold", color: "white" }}>{file.name}</div>
            <div style={{ fontSize: "11px", fontFamily: "monospace", opacity: 0.8, marginTop: "4px", color: "#94a3b8" }}>
              SHA-256: {fileHash}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // STEP 5: Seal (Was Step 4)
  const renderStep5 = () => (
    <div style={styles.fadeIn}>
      <h2 style={styles.title}>Review & Submit KYC</h2>
      <p style={styles.subtitle}>Finalize the details before immutable storage.</p>

      <div style={{ marginBottom: "30px", background: "#1e293b", borderRadius: "16px", padding: "20px", border: "1px solid #334155", boxSizing: "border-box" }}>
        <div style={styles.summaryItem}>
          <span style={{ color: "#94a3b8" }}>Photo</span>
          {formData.photoUrl ? (
            <img src={formData.photoUrl} alt="Student" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "1px solid #475569" }} />
          ) : <span>Not Captured</span>}
        </div>
        <div style={styles.sectionHeader}>Identity</div>
        <div style={styles.summaryItem}>
          <span style={{ color: "#94a3b8" }}>Full Name</span>
          <strong>{formData.fullName}</strong>
        </div>
        <div style={styles.summaryItem}>
          <span style={{ color: "#94a3b8" }}>DOB / Gender</span>
          <strong>{formData.dob} ({formData.gender})</strong>
        </div>
        <div style={styles.summaryItem}>
          <span style={{ color: "#94a3b8" }}>Contacts</span>
          <strong>{formData.phone} {formData.email && `/ ${formData.email}`}</strong>
        </div>

        {formData.pan && (
          <>
            <div style={styles.sectionHeader}>ID</div>
            <div style={styles.summaryItem}><span style={{ color: "#94a3b8" }}>PAN</span><strong>{formData.pan}</strong></div>
          </>
        )}

        <div style={styles.sectionHeader}>Asset</div>
        <div style={styles.summaryItem}>
          <span style={{ color: "#94a3b8" }}>File Name</span>
          <strong>{file?.name}</strong>
        </div>
        <div style={styles.summaryItem}>
          <span style={{ color: "#94a3b8" }}>Hash</span>
          <code style={{ fontSize: "12px", color: "var(--accent-blue)" }}>{fileHash?.slice(0, 20)}...</code>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "20px" }}>
        <p style={{ fontSize: "13px", color: "#ef4444", marginBottom: "20px", fontWeight: "600" }}>
          ⚠️ Action is Irreversible: Data cannot be edited once on-chain.
        </p>

        {loading ? (
          <div style={{ color: "#2563eb", fontWeight: "bold", fontSize: "18px" }}>{status}...</div>
        ) : (
          <button
            style={{ ...styles.btn(true), width: "100%", fontSize: "18px" }}
            onClick={handleUpload}
          >
            🔒 Seal on Blockchain
          </button>
        )}
      </div>
    </div>
  );

  // Success Screen
  if (showSuccess) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <div style={{ fontSize: "80px", marginBottom: "20px" }}>🎉</div>
        <h1 style={styles.title}>Certificate Issued Successfully!</h1>
        <p style={{ color: "#64748b", marginBottom: "40px" }}>
          The document hash and identity proof are now live on the blockchain.
        </p>

        <div style={{ display: "inline-block", padding: "30px", background: "white", borderRadius: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.1)" }}>
          <QRCodeCanvas value={`http://localhost:3000/verify?hash=${fileHash}`} size={200} />
          <p style={{ marginTop: "15px", fontSize: "14px", color: "#94a3b8", fontWeight: "600" }}>Scan to Verify</p>
        </div>

        <div style={{ marginTop: "50px" }}>
          <button style={styles.btn(true)} onClick={() => window.location.reload()}>
            Issue Another Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Stepper */}
      <div style={styles.stepper}>
        <div style={styles.line} />
        <div style={styles.lineProgress} />

        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ position: "relative" }}>
            <div style={styles.step(step >= i)}>
              {step > i ? "✓" : i}
            </div>
            <div style={styles.stepLabel(step >= i)}>
              {i === 1 ? "Identity" : i === 2 ? "Govt IDs" : i === 3 ? "Photo" : i === 4 ? "Asset" : "Seal"}
            </div>
          </div>
        ))}
      </div>

      {/* Card Content */}
      <div style={styles.card}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}

        <div style={styles.btnContainer}>
          <button
            style={{ ...styles.btn(false), visibility: step === 1 ? "hidden" : "visible" }}
            onClick={() => setStep(s => s - 1)}
          >
            ← Back
          </button>

          {step < 5 && (
            <button
              style={styles.btn(true)}
              onClick={() => {
                // Validation Logic
                if (step === 1) {
                  if (!formData.fullName) return alert("Please enter Full Name");
                  if (!formData.dob) return alert("Please select Date of Birth");
                  if (!formData.phone) return alert("Please enter Phone Number");
                  if (!formData.aadhaar) return alert("Please enter Aadhaar Number");
                }
                if (step === 2) {
                  if (!formData.pan) return alert("Permanent Account Number (PAN) is mandatory");
                }
                if (step === 3) {
                  if (!formData.photoUrl) return alert("Please capture a photo to proceed");
                }
                if (step === 4) {
                  if (!file) return alert("Please upload a document file to proceed");
                }
                setStep(s => s + 1);
              }}
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddPage;
