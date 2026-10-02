import React, { useState, useEffect, useCallback, useRef } from "react";
import "./UniversalQRScanner.css";

export default function UniversalQRScanner() {
  const [qrCodes, setQrCodes] = useState({});
  const [networkStatus, setNetworkStatus] = useState("detecting");
  const [testResults, setTestResults] = useState({});
  const [copiedUrl, setCopiedUrl] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");

  // Generate QR codes using multiple services for reliability
  const generateQRCode = useCallback(async (url) => {
    try {
      // Use multiple QR code generation services for reliability
      const services = [
        {
          name: "QR Server",
          url: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&format=png&data=${encodeURIComponent(url)}`,
          fallback: true
        },
        {
          name: "Google Charts",
          url: `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${encodeURIComponent(url)}`,
          fallback: true
        },
        {
          name: "QuickChart",
          url: `https://quickchart.io/qr?text=${encodeURIComponent(url)}&size=250`,
          fallback: true
        }
      ];

      // Try each service until one succeeds
      for (const service of services) {
        try {
          const response = await fetch(service.url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const qrUrl = URL.createObjectURL(blob);
            return { success: true, url: qrUrl, service: service.name };
          }
        } catch (error) {
          console.warn(`QR service ${service.name} failed:`, error);
          if (!service.fallback) {
            throw error;
          }
        }
      }
      
      throw new Error("All QR services failed");
    } catch (error) {
      console.error("QR code generation failed:", error);
      return { success: false, error: error.message };
    }
  }, []);

  // Test URL accessibility with proper error handling
  const testURLInBrowser = useCallback(async (url) => {
    try {
      // Method 1: HEAD request (fastest)
      const headResponse = await fetch(url, {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-cache",
        signal: AbortSignal.timeout(3000)
      });
      
      if (headResponse.ok) {
        return { url, status: 'success', message: '✅ Working' };
      }
      
      // Method 2: GET request (fallback)
      try {
        const getResponse = await fetch(url, { 
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000)
        });
        
        if (getResponse.ok) {
          return { url, status: 'success', message: '✅ Working' };
        }
      } catch (error) {
        return { url, status: 'error', message: '❌ Not accessible' };
      }
    } catch (error) {
      return { url, status: 'error', message: '❌ Not accessible' };
    }
  }, []);

  // Get all working URLs for testing
  const getAllWorkingURLs = useCallback(async () => {
    const urls = {};
    
    // 1. Standard localhost (works in all browsers)
    urls.localhost = "http://localhost:3000";
    
    // 2. 127.0.0.1 (alternative localhost - more reliable)
    urls.localhost_alt = "http://127.0.0.1:3000";
    
    // 3. Computer name (Windows networking)
    urls.computer_name = `http://${window.location.hostname}:3000`;
    
    // 4. Public IP (for external access)
    try {
      const publicIPResponse = await fetch('https://api.ipify.org?format=json', {
        signal: AbortSignal.timeout(3000)
      });
      if (publicIPResponse.ok) {
        const data = await publicIPResponse.json();
        urls.public_ip = `http://${data.ip}:3000`;
      }
    } catch (error) {
      console.warn("Could not fetch public IP:", error);
      urls.public_ip = "http://your-public-ip:3000"; // Fallback
    }
    
    return urls;
  }, []);

  // Test browser compatibility for each URL
  const testBrowserCompatibility = useCallback(async (urls) => {
    const results = {};
    
    for (const [key, url] of Object.entries(urls)) {
      try {
        const result = await testURLInBrowser(url);
        results[key] = result;
      } catch (error) {
        results[key] = { url, status: 'error', message: '❌ Not accessible' };
      }
    }
    
    setTestResults(results);
    return results;
  }, [testURLInBrowser]);

  // Copy URL to clipboard (browser compatible)
  const copyURL = async (url) => {
    try {
      // Modern browsers
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(""), 3000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // Open URL in new tab (browser compatible)
  const openURL = (url) => {
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  };

  // Generate manual QR code
  const generateManualQR = useCallback(async () => {
    if (manualUrl) {
      const result = await generateQRCode(manualUrl);
      if (result.success) {
        setQrCodes({ ...qrCodes, manual: result.url });
      }
    }
  }, [generateQRCode]);

  // Get URL display name
  const getURLDisplayName = (key) => {
    const names = {
      localhost: "Localhost (Standard)",
      localhost_alt: "Localhost (127.0.0.1)",
      computer_name: "Computer Name",
      manual: "Custom URL",
    };
    
    if (key.startsWith("local_")) {
      const index = parseInt(key.split("_")[1]);
      return `Local Network ${index + 1}`;
    }
    
    return names[key] || key;
  };

  // Get URL from key
  const getURLFromKey = (key) => {
    const urlMap = {
      localhost: "http://localhost:3000",
      localhost_alt: "http://127.0.0.1:3000",
      computer_name: `http://${window.location.hostname}:3000`,
      manual: manualUrl,
    };

    if (key.startsWith("local_")) {
      const index = parseInt(key.split("_")[1]);
      const ips = [
        "192.168.1.100",
        "192.168.1.101",
        "192.168.1.102",
        "192.168.0.100",
        "192.168.0.101",
        "192.168.0.102",
        "10.0.0.100",
        "10.0.0.101",
        "10.0.0.102",
      ];
      return `http://${ips[index]}:3000`;
    }

    return urlMap[key];
  };

  // Detect network configuration on component mount
  useEffect(() => {
    const detectNetworkConfig = async () => {
      setNetworkStatus("detecting");

      try {
        // Get all possible URLs that work in browsers
        const urls = await getAllWorkingURLs();

        // Generate QR codes for each URL with browser compatibility
        const qrCodeData = {};
        for (const [key, url] of Object.entries(urls)) {
          qrCodeData[key] = await generateQRCode(url);
        }

        setQrCodes(qrCodeData);
        setNetworkStatus("ready");

        // Test each URL for browser compatibility
        testBrowserCompatibility(urls);
      } catch (error) {
        console.error("Network detection error:", error);
        setNetworkStatus("error");
      }
    };

    detectNetworkConfig();
  }, [getAllWorkingURLs, testBrowserCompatibility, testURLInBrowser]);

  return (
    <div className="universal-qr-scanner">
      <div className="scanner-header">
        <h1>🌐 Browser-Compatible QR Scanner</h1>
        <p>QR codes that work in all browsers without errors</p>
        <div className="status-indicator">
          <span className={`status ${networkStatus}`}>
            {networkStatus === "detecting" && "🔍 Detecting network..."}
            {networkStatus === "ready" && "✅ Ready for scanning"}
            {networkStatus === "error" && "❌ Network error"}
          </span>
        </div>
      </div>

      {/* QR Codes Display */}
      <div className="qr-section">
        <h2>🎯 Most Reliable QR Codes</h2>
        <div className="qr-grid">
          {/* Localhost Options */}
          <div className="qr-card reliable">
            <h3>🏠 Localhost (Standard)</h3>
            <div className="qr-image-container">
              {qrCodes.localhost && (
                <img
                  src={qrCodes.localhost}
                  alt="Localhost QR"
                  className="qr-image"
                />
              )}
              {testResults.localhost && testResults.localhost.status && (
                <div className={`test-badge ${testResults.localhost.status}`}>
                  {testResults.localhost.message}
                </div>
              )}
            </div>
            <div className="url-info">
              <code>http://localhost:3000</code>
              <div className="url-actions">
                <button
                  onClick={() => copyURL("http://localhost:3000")}
                  className="action-btn"
                >
                  📋{" "}
                  {copiedUrl === "http://localhost:3000"
                    ? "✅ Copied!"
                    : "Copy"}
                </button>
                <button
                  onClick={() => openURL("http://localhost:3000")}
                  className="action-btn"
                >
                  🌐 Open
                </button>
              </div>
            </div>
            <p className="description">Most reliable - works in all browsers</p>
          </div>

          {/* 127.0.0.1 Alternative */}
          <div className="qr-card reliable">
            <h3>🏠 Localhost (127.0.0.1)</h3>
            <div className="qr-image-container">
              {qrCodes.localhost_alt && (
                <img
                  src={qrCodes.localhost_alt}
                  alt="Localhost Alt QR"
                  className="qr-image"
                />
              )}
              {testResults.localhost_alt && testResults.localhost_alt.status && (
                <div
                  className={`test-badge ${testResults.localhost_alt.status}`}
                >
                  {testResults.localhost_alt.message}
                </div>
              )}
            </div>
            <div className="url-info">
              <code>http://127.0.0.1:3000</code>
              <div className="url-actions">
                <button
                  onClick={() => copyURL("http://127.0.0.1:3000")}
                  className="action-btn"
                >
                  📋{" "}
                  {copiedUrl === "http://127.0.0.1:3000"
                    ? "✅ Copied!"
                    : "Copy"}
                </button>
                <button
                  onClick={() => openURL("http://127.0.0.1:3000")}
                  className="action-btn"
                >
                  🌐 Open
                </button>
              </div>
            </div>
            <p className="description">Alternative localhost - very reliable</p>
          </div>

          {/* Computer Name */}
          <div className="qr-card">
            <h3>💻 Computer Name</h3>
            <div className="qr-image-container">
              {qrCodes.computer_name && (
                <img
                  src={qrCodes.computer_name}
                  alt="Computer Name QR"
                  className="qr-image"
                />
              )}
              {testResults.computer_name && testResults.computer_name.status && (
                <div
                  className={`test-badge ${testResults.computer_name.status}`}
                >
                  {testResults.computer_name.message}
                </div>
              )}
            </div>
            <div className="url-info">
              <code>http://{window.location.hostname}:3000</code>
              <div className="url-actions">
                <button
                  onClick={() =>
                    copyURL(`http://${window.location.hostname}:3000`)
                  }
                  className="action-btn"
                >
                  📋 Copy
                </button>
                <button
                  onClick={() =>
                    openURL(`http://${window.location.hostname}:3000`)
                  }
                  className="action-btn"
                >
                  🌐 Open
                </button>
              </div>
            </div>
            <p className="description">Windows networking name</p>
          </div>
        </div>

        {/* Local Network Options */}
        <div className="qr-section">
          <h2>📱 Local Network Options</h2>
          <div className="qr-grid">
            {Object.keys(qrCodes)
              .filter((key) => key.startsWith("local_"))
              .slice(0, 3)
              .map((key, index) => {
                const url = getURLFromKey(key);
                const testResult = testResults[key];
                return (
                  <div key={key} className="qr-card">
                    <h3>📱 {getURLDisplayName(key)}</h3>
                    <div className="qr-image-container">
                      <img
                        src={qrCodes[key]}
                        alt={`Local Network QR ${index + 1}`}
                        className="qr-image"
                      />
                      {testResult && testResult.status && (
                        <div className={`test-badge ${testResult.status}`}>
                          {testResult.message}
                        </div>
                      )}
                    </div>
                    <div className="url-info">
                      <code>{url}</code>
                      <div className="url-actions">
                        <button
                          onClick={() => copyURL(url)}
                          className="action-btn"
                        >
                          📋 {copiedUrl === url ? "✅ Copied!" : "Copy"}
                        </button>
                        <button
                          onClick={() => openURL(url)}
                          className="action-btn"
                        >
                          🌐 Open
                        </button>
                      </div>
                    </div>
                    <p className="description">
                      For devices on same WiFi network
                    </p>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Manual QR Generation */}
        <div className="manual-section">
          <h2>✏️ Custom QR Code</h2>
          <div className="manual-form">
            <input
              type="text"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="Enter URL (e.g., http://192.168.1.100:3000)"
              className="manual-input"
            />
            <button onClick={generateManualQR} className="manual-btn">
              🎯 Generate QR
            </button>
          </div>
          {qrCodes.manual && (
            <div className="manual-result">
              <img src={qrCodes.manual} alt="Custom QR" className="qr-image" />
              <div className="url-info">
                <code>{manualUrl}</code>
                <button onClick={() => copyURL(manualUrl)} className="action-btn">
                  📋 Copy URL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Browser Testing Tools */}
      <div className="testing-tools">
        <h2>🧪 Browser Testing Tools</h2>
        <div className="tool-grid">
          <div className="tool-item">
            <h3>🔄 Test All URLs</h3>
            <button
              onClick={() => testBrowserCompatibility(getAllWorkingURLs())}
              className="test-btn"
            >
              🔄 Run Tests
            </button>
            <p>Test all URLs for browser compatibility</p>
          </div>
          <div className="tool-item">
            <h3>🔄 Refresh Scanner</h3>
            <button
              onClick={() => window.location.reload()}
              className="test-btn"
            >
              🔄 Refresh
            </button>
            <p>Re-detect network and regenerate QR codes</p>
          </div>
          <div className="tool-item">
            <h3>📊 Test Results</h3>
            <div className="test-summary">
              {
                Object.values(testResults).filter((r) => r && r.status === "success")
                  .length
              }{" "}
              of {Object.keys(testResults).length} URLs working
            </div>
            <p>Current browser compatibility status</p>
          </div>
        </div>
      </div>

      {/* Browser Compatibility Guide */}
      <div className="compatibility-guide">
        <h2>📋 Browser Compatibility Guide</h2>
        <div className="guide-grid">
          <div className="guide-item">
            <h3>🌍 Chrome/Edge</h3>
            <ul>
              <li>Best QR scanning support</li>
              <li>Built-in QR reader in address bar</li>
              <li>Right-click → Create QR code</li>
              <li>Mobile app integration</li>
            </ul>
          </div>
          <div className="guide-item">
            <h3>🦊 Firefox</h3>
            <ul>
              <li>Good QR scanning support</li>
              <li>Third-party extensions available</li>
              <li>Mobile Firefox has built-in scanner</li>
              <li>Copy-paste URLs work well</li>
            </ul>
          </div>
          <div className="guide-item">
            <h3>🍎 Safari</h3>
            <ul>
              <li>Excellent iOS QR scanning</li>
              <li>Camera app integration</li>
              <li>Mac Safari supports QR codes</li>
              <li>Best for iPhone/iPad users</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
