const https = require('https');

// The Key currently in use
const API_KEY = "AIzaSyCKs1V-mYizoAJ21uPZJZliXbOwWUkt9pA";

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", json.error.message);
            }
            const fs = require('fs');
            if (json.models) {
                const names = json.models
                    .filter(m => m.supportedGenerationMethods.includes("generateContent"))
                    .map(m => m.name.replace("models/", ""))
                    .join("\n");
                fs.writeFileSync('models.txt', names);
                console.log("Models written to models.txt");
            } else {
                console.log("No models found or unexpected response:", json);
            }
        } catch (e) {
            console.error("Parse Error:", e.message);
        }
    });

}).on("error", (err) => {
    console.error("Network Error:", err.message);
});
