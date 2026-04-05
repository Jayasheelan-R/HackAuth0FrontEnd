"use client";

import { Auth0Provider } from "@auth0/auth0-react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Auth0Provider
          domain="dev-ye3ygyx4dj6j4j04.eu.auth0.com"
          clientId="N8i8lBceDcm2Do6FRlXkmwwJil5sfu5G"
          authorizationParams={{
            redirect_uri: "http://localhost:3000",
            audience: "https://my-api",
            scope: "openid profile email offline_access",
          }}
        >
          {children}
        </Auth0Provider>
      </body>
    </html>
  );
}