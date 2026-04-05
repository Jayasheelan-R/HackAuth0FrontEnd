"use client";

import { Auth0Provider } from "@auth0/auth0-react";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>AI DevOps Agent</title>
        <meta name="description" content="AI-powered PR review and issue management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#080c10" }}>
        <Auth0Provider
          domain="dev-ye3ygyx4dj6j4j04.eu.auth0.com"
          clientId="N8i8lBceDcm2Do6FRlXkmwwJil5sfu5G"
          authorizationParams={{
            redirect_uri: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
            audience: "https://my-api",
            scope: "openid profile email offline_access",
          }}
          cacheLocation="localstorage"
        >
          {children}
        </Auth0Provider>
      </body>
    </html>
  );
}