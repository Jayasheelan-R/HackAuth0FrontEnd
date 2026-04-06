"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import "./globals.css";

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
  const [desc, setDesc] = useState("");
  const [prNumber, setPrNumber] = useState("");
  const [credentials, setCredentials] = useState([]);
  const [credsLoading, setCredsLoading] = useState(false);
  const [credsLoaded, setCredsLoaded] = useState(false);
  const [revoking, setRevoking] = useState(null);

  useEffect(() => {
    if (isAuthenticated) fetchCredentials();
  }, [isAuthenticated]);

  if (isLoading) return (
    <div className="da-splash">
      <span className="da-splash-text">initializing agent</span>
      <span className="da-cursor">_</span>
    </div>
  );

  const loginWithGitHub = () =>
    loginWithRedirect({
      authorizationParams: {
        connection: "github",
        prompt: "login",
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
      loginWithGitHub();
      throw new Error("Authentication required");
    }
  };

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
      if (contentType.includes("application/json")) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || `${res.status} ${res.statusText}`);
      }
      const text = await res.text().catch(() => "");
      throw new Error(text || `${res.status} ${res.statusText}`);
    }
    return contentType.includes("application/json")
      ? res.json()
      : { __text: await res.text() };
  };

  const fetchCredentials = async () => {
    try {
      setCredsLoading(true);
      const token = await getToken();
      const data = await apiRequest("/agent/credentials", "GET", token);
      setCredentials(data.credentials || []);
    } catch (err) {
      setCredentials([]);
      appendOutput(`⚠️ Could not load credentials: ${err.message}`);
    } finally {
      setCredsLoading(false);
      setCredsLoaded(true);
    }
  };

  const handleRevoke = async (provider, providerId) => {
    if (!confirm(`Revoke agent access to ${provider}? This cannot be undone.`)) return;
    try {
      setRevoking(provider);
      const token = await getToken();
      await apiRequest(`/agent/credentials/${provider}/${providerId}`, "DELETE", token);
      setCredentials((prev) => prev.filter((c) => c.provider !== provider));
      appendOutput(`🔒 Access revoked: ${provider}`);
    } catch (err) {
      appendOutput(`❌ Revoke failed: ${err.message}`);
    } finally {
      setRevoking(null);
    }
  };

  const resetOutput = (text = "") => setResult(text);
  const appendOutput = (text) => setResult((prev) => prev + text + "\n");

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
    if (!repo || !repo.includes("/")) throw new Error("Invalid repo (format: owner/repo)");
    if (requirePR && (!prNumber || isNaN(prNumber))) throw new Error("Invalid PR number");
  };

  const runAgent = async () => {
    try {
      setLoading(true);
      resetOutput("🤖 Agent started...\n");
      validateInputs(true);
      await simulateThinking();
      const token = await getToken();
      const data = await apiRequest("/github/review", "POST", token, {
        repo,
        prNumber: Number(prNumber),
      });
      if (data.__text) resetOutput(`❌ ${data.__text}`);
      else if (data.error) resetOutput(`❌ ${data.error}`);
      else resetOutput(`✅ Review posted to PR #${prNumber}\n\n${data.review || ""}`);
    } catch (err) {
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

      if (!desc.trim()) {
        throw new Error("Description cannot be empty");
      }

      const token = await getToken();

      const data = await apiRequest("/github/issue", "POST", token, {
        repo,
        title: "AI Agent Issue",
        body: desc,
      });

      if (data.error) resetOutput(`❌ ${data.error}`);
      else resetOutput(`✅ Issue created:\n${data.html_url}`);
    } catch (err) {
      resetOutput(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const scopeColor = (scope) => {
    if (scope.includes("write") || scope.includes("delete")) return "scope-write";
    if (scope.includes("read")) return "scope-read";
    return "scope-other";
  };

  const hasGitHub = credentials.some((c) => c.provider === "github");

  return (
    <div className="da-root">
      <div className="da-card">

        <div className="da-titlebar">
          <div className="da-dots">
            <div className="da-dot da-dot-r" />
            <div className="da-dot da-dot-y" />
            <div className="da-dot da-dot-g" />
          </div>
          <span className="da-titlebar-label">devops-agent · v1.0.0</span>
          {isAuthenticated && hasGitHub && (
            <div className="da-status-pill">
              <div className="da-pulse" />
              LIVE
            </div>
          )}
        </div>

        <div className="da-body">
          {!isAuthenticated ? (

            <div className="da-login">
              <div className="da-login-icon">🤖</div>
              <h2>AI DevOps Agent</h2>
              <p>Automated PR reviews and issue management — powered by AI, driven by your GitHub.</p>
              <div className="da-login-actions">
                <button className="da-btn da-btn-primary" onClick={loginWithGitHub}>
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </span>
                  Continue with GitHub
                </button>
              </div>
            </div>

          ) : credsLoaded && !hasGitHub ? (

            <div className="da-login">
              <div className="da-login-icon">🔑</div>
              <h2>GitHub Access Required</h2>
              <p>This agent needs your GitHub account. Please log in with GitHub to continue.</p>
              <div className="da-login-actions">
                <button className="da-btn da-btn-primary" onClick={loginWithGitHub}>
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </span>
                  Connect GitHub
                </button>
                <button
                  className="da-btn da-btn-ghost"
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                >
                  ⎋ Logout
                </button>
              </div>
            </div>

          ) : (

            <>
              <div className="da-hero">
                <div className="da-eyebrow">// AI-Powered DevOps</div>
                <div className="da-headline">Dev<span>Ops</span> Agent</div>
                {user?.name && (
                  <div className="da-user-badge">
                    <span className="badge-icon">◈</span>
                    {user.name}
                  </div>
                )}
              </div>

              <div className="da-section-label">
                <span>🔑 Agent Permissions</span>
                <span className="da-vault-badge">
                  <span className="da-vault-dot" />
                  Connected Accounts
                </span>
              </div>

              <div className="da-permissions-panel">
                {credsLoading ? (
                  <div className="da-perm-empty">
                    <span className="da-loading-txt">⏳ Loading connected accounts...</span>
                  </div>
                ) : (
                  credentials.map((cred) => (
                    <div key={cred.provider} className="da-perm-row">
                      <div className="da-perm-left">
                        <div className="da-perm-name">
                          <span className="da-perm-dot" />
                          {cred.provider}
                          <span className="da-perm-type">{cred.isSocial ? "social" : "enterprise"}</span>
                        </div>
                        <div className="da-perm-scopes">
                          {["repo", "issues:write"].map((s) => (
                            <span key={s} className={`da-scope-badge ${scopeColor(s)}`}>{s}</span>
                          ))}
                        </div>
                        <div className="da-perm-meta">
                          connection: {cred.connection}
                        </div>
                      </div>
                      <button
                        className="da-btn-revoke"
                        onClick={() => handleRevoke(cred.provider, cred.user_id)}
                        disabled={revoking === cred.provider}
                      >
                        {revoking === cred.provider ? "Revoking..." : "⎋ Revoke"}
                      </button>
                    </div>
                  ))
                )}
              </div>

              <hr className="da-divider" />

              <hr className="da-divider" />

              <div className="da-fields">
                <div className="da-field">
                  <label className="da-label">Target Repository</label>
                  <div className="da-input-wrap">
                    <span className="da-input-prefix">~/</span>
                    <input
                      className="da-input"
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      placeholder="owner/repo"
                    />
                  </div>
                </div>

                <div className="da-field">
                  <label className="da-label">PR Number</label>
                  <div className="da-input-wrap">
                    <span className="da-input-prefix">#</span>
                    <input
                      className="da-input"
                      value={prNumber}
                      onChange={(e) => setPrNumber(e.target.value)}
                      placeholder="e.g. 42"
                      type="number"
                    />
                  </div>
                </div>

                {/* ✅ NEW DESCRIPTION FIELD */}
                <div className="da-field">
                  <label className="da-label">Issue Description</label>
                  <textarea
                    className="da-input"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Describe the issue..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="da-btn-row">
                <button className="da-btn da-btn-primary" onClick={runAgent} disabled={loading}>
                  <span>🚀</span> Run PR Check
                </button>

                <button className="da-btn da-btn-secondary" onClick={createIssue} disabled={loading}>
                  <span>＋</span> Create Issue
                </button>

                <button
                  className="da-btn da-btn-ghost"
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                >
                  ⎋ Logout
                </button>
              </div>

              <hr className="da-divider" />

              <div className="da-terminal">
                <div className="da-terminal-header">
                  <div className="da-terminal-title">
                    <div className="da-terminal-dot" />
                    output stream
                  </div>
                  <span className="da-terminal-tag">STDOUT</span>
                </div>
                {loading && <div className="da-loading-bar" />}
                <div className="da-terminal-body">
                  {loading && <span className="da-loading-txt">⏳ Processing...{"\n\n"}</span>}
                  {result || (!loading && (
                    <span className="da-empty-hint">{"// waiting for instructions..."}</span>
                  ))}
                  {!loading && <span className="da-cursor">_</span>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
