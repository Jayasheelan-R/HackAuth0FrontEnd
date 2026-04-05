"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5004";

export default function Home() {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    user,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [repo, setRepo] = useState("Jayasheelan-R/ai-devops-agent");
  const [prNumber, setPrNumber] = useState("");

  if (isLoading) return <div>Loading...</div>;

  /* =========================
     🔐 AUTH HELPERS
  ========================== */

  const login = () =>
    loginWithRedirect({
      authorizationParams: {
        audience: "https://my-api",
        scope: "openid profile email offline_access",
      },
    });

  const connectGitHub = () =>
    loginWithRedirect({
      authorizationParams: {
        connection: "github",
        prompt: "consent",
        audience: "https://my-api",
        scope: "openid profile email offline_access",
      },
    });

  const getToken = async () => {
    try {
      return await getAccessTokenSilently({
        authorizationParams: { audience: "https://my-api" },
      });
    } catch {
      await login();
      throw new Error("Authentication required");
    }
  };

  /* =========================
     🌐 API HELPER
  ========================== */

  const apiRequest = async (url, method, token, body) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`${res.status} ${res.statusText} ${text}`);
    }

    return contentType.includes("application/json")
      ? res.json()
      : { __text: await res.text() };
  };

  /* =========================
     🧠 UI HELPERS
  ========================== */

  const resetOutput = (text = "") => setResult(text);

  const appendOutput = (text) =>
    setResult((prev) => prev + text + "\n");

  const simulateThinking = async () => {
    const steps = [
      "🔍 Fetching PR...",
      "📂 Reading changes...",
      "🧠 AI analyzing...",
      "🚦 Decision making...",
    ];

    for (const step of steps) {
      appendOutput(step);
      await new Promise((r) => setTimeout(r, 500));
    }
  };

  const validateInputs = (requirePR = false) => {
    if (!repo || !repo.includes("/")) {
      throw new Error("Invalid repo (format: owner/repo)");
    }
    if (requirePR && (!prNumber || isNaN(prNumber))) {
      throw new Error("Invalid PR number");
    }
  };

  /* =========================
     🚀 ACTIONS
  ========================== */

  const runAgent = async () => {
    try {
      setLoading(true);
      resetOutput("🤖 Agent started...\n");

      validateInputs();

      await simulateThinking();

      const token = await getToken();

      const data = await apiRequest(
        "/github/review",
        "POST",
        token,
        {
          repo,
          prNumber: Number(prNumber) || 8, // fallback
        }
      );

      if (data.__text) {
        resetOutput(`❌ ${data.__text}`);
      } else {
        resetOutput(
          `✅ Analysis Complete\n\n🚀 PR Review Completed\n\nComments Added`
        );
      }
    } catch (err) {
      console.error(err);
      resetOutput(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async () => {
    try {
      setLoading(true);
      resetOutput("⏳ Creating issue...\n");

      validateInputs();

      const token = await getToken();

      const data = await apiRequest(
        "/github/issue",
        "POST",
        token,
        {
          repo,
          title: "AI Agent Issue",
          body: "Created via AI DevOps Agent",
        }
      );

      resetOutput(`✅ Issue created:\n${data.html_url}`);
    } catch (err) {
      console.error(err);
      resetOutput(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     🎨 UI
  ========================== */

  return (
    <div style={{ padding: 40, maxWidth: 900, margin: "auto" }}>
      {!isAuthenticated ? (
        <button onClick={login}>Login</button>
      ) : (
        <>
          <h1>🤖 AI DevOps Agent</h1>
          <p>Welcome {user?.name}</p>

          <h3>Repository</h3>
          <input
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="owner/repo"
            style={{ width: "100%", padding: 10 }}
          />

          

          <button onClick={runAgent} disabled={loading}>
            🚀 Run PR Check
          </button>

          <button onClick={createIssue} disabled={loading}>
            Create Issue
          </button>

          <br /><br />

          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            Logout
          </button>

          <hr />

          <h3>🧠 Output</h3>
          <pre
            style={{
              background: "#111",
              color: "#0f0",
              padding: 20,
              borderRadius: 10,
              minHeight: 200,
              whiteSpace: "pre-wrap",
            }}
          >
            {loading ? "⏳ Processing...\n\n" : ""}
            {result}
          </pre>
        </>
      )}
    </div>
  );
}