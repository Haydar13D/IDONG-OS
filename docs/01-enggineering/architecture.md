# IDONG OS System Architecture Specification
**Version:** 1.0  
**Author:** Principal Software Architect  
**Status:** Approved  

This document details the system architecture of **IDONG OS**, focusing on the request lifecycle, authentication mechanisms, cryptographically secure session flows, and edge middleware routing constraints.

---

## 1. Global Request Flow

Traffic routed to the application follows a zero-trust network boundary. The server is not exposed to the public internet; instead, it is hosted inside a private home local area network (LAN) and accessed via a Tailscale Virtual Private Network (VPN) tunnel.

```mermaid
sequenceDiagram
    autonumber
    actor Client as User Device (Mobile/PC)
    participant TS as Tailscale VPN (Tailnet)
    participant TS_Serve as Tailscale Serve HTTP Proxy
    participant App as Next.js Application (Port 3000)
    participant DB as SQLite Database File

    Client->>TS: Request URL (https://personalhq.<tailnet>.ts.net/dashboard)
    activate TS
    Note over TS: VPN authenticates device identity and decrypts traffic.
    TS->>TS_Serve: Route decrypted packet to Proxmox VM
    activate TS_Serve
    Note over TS_Serve: Automatically maps SSL certificates and routes HTTPS.
    TS_Serve->>App: Reverse Proxy to 127.0.0.1:3000
    activate App
    App->>DB: Query configuration / user data
    DB-->>App: Return records
    App-->>TS_Serve: Rendered page output (HTML/RSC)
    deactivate App
    TS_Serve-->>TS: Return SSL secure stream
    deactivate TS_Serve
    TS-->>Client: Renders dashboard on client screen
    deactivate TS
```

---

## 2. Authentication Flow

The system employs a single-user passcode verification scheme. The passcode is stored securely as a SHA-256 hex hash in the environment variables, protecting against plain-text leaks.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Web Browser
    participant Action as Login Server Action (actions.ts)
    participant Auth as Auth Helper (auth.ts)
    participant Session as Session Helper (session.ts)
    participant Cookie as Cookie Helper (cookies.ts)

    Client->>Action: POST /login form passcode PIN
    activate Action
    Action->>Auth: verifyPassword(passcode)
    activate Auth
    Note over Auth: 1. Hash input passcode with SHA-256.<br/>2. Load stored hash from process.env.APP_PASSWORD.<br/>3. Execute crypto.timingSafeEqual().
    Auth-->>Action: Return boolean (isValid)
    deactivate Auth

    alt isValid is False
        Action-->>Client: Return error: "Invalid passcode. Access Denied."
    else isValid is True
        Action->>Session: encryptSession(payload)
        activate Session
        Note over Session: Create HMAC-SHA256 signature and encrypt using Web Crypto.
        Session-->>Action: Return signed session token (base64url)
        deactivate Session
        Action->>Cookie: setSessionCookie(token)
        activate Cookie
        Note over Cookie: Set secure HTTP-only cookie in header.
        Cookie-->>Action: Confirm cookie state
        deactivate Cookie
        Action-->>Client: Redirect to /dashboard
    end
    deactivate Action
```

---

## 3. Session Flow & Web Crypto API

To bypass Edge Runtime constraints (which forbid synchronous Node `crypto` functions like `pbkdf2Sync` and `createCipheriv`), sessions use the global **Web Crypto API** (`crypto.subtle`). Tokens are signed using **HMAC-SHA256**, ensuring authenticity and preventing user-side payload tampering.

### Token Anatomy
The session token is a period-delimited composite string:
`[PayloadBase64Url].[SignatureBase64Url]`

*   **PayloadBase64Url:** Base64url-encoded string of the session JSON object (e.g. `{ role: "admin", createdAt: 1783678555 }`).
*   **SignatureBase64Url:** Base64url-encoded HMAC-SHA256 signature calculated from the Payload string and `process.env.SESSION_SECRET`.

### Decryption & Verification Algorithm:
```
               [Incoming Token String]
                         │
                         ▼
             Split by period delimiter (.)
             /                           \
            ▼                             ▼
   [Payload Base64]              [Signature Base64]
            │                             │
    JSON Parse text               Convert to Buffer
            │                             │
    [Session Payload]             [Signature Bytes]
            │                             │
            └──────────────┬──────────────┘
                           │
                           ▼
          Run crypto.subtle.verify(HMAC)
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
       [IsValid: True]             [IsValid: False]
           │                               │
    Return Payload                    Return null
```

---

## 4. Cookie Lifecycle

To safeguard session validity against cross-site scripting (XSS) and cross-site request forgery (CSRF) vectors, the session cookie is configured with strict security flags:

*   **Cookie Name:** `idong_os_session`
*   **HTTP-Only:** Enabled (`httpOnly: true`). Blocks JavaScript execution environments (e.g., `document.cookie`) from reading the session string, neutralising XSS token extraction.
*   **Secure:** Configured to match environment status (`secure: process.env.NODE_ENV === "production"`). Forces browsers to only transmit cookies over encrypted HTTPS channels in production.
*   **SameSite:** Configured to `SameSite=Strict`. The browser will not send the cookie along with cross-site requests, mitigating CSRF session hijacking.
*   **Expiration:** 30 days (`maxAge: 2592000`). Once expired, browsers purge the cookie, forcing the user to re-authenticate at `/login`.

---

## 5. Middleware Sequence

Every HTTP request routed to the app passes through Next.js Edge Middleware. This serves as the primary route protector, verifying sessions before executing page generation or data loading.

```mermaid
flowchart TD
    Request([Client Request]) --> MW[Next.js Edge Middleware]
    MW --> CheckPath{Matches /dashboard* or /settings*?}
    
    CheckPath -- No --> Allow([Allow Request: Route to Target Component])
    CheckPath -- Yes --> GetCookie{Has idong_os_session cookie?}
    
    GetCookie -- No --> Redirect[Redirect to /login]
    GetCookie -- Yes --> VerifySession{Verify token via Web Crypto decryptSession?}
    
    VerifySession -- Valid Payload --> Allow
    VerifySession -- Invalid/Expired --> Redirect
    
    Redirect --> RenderLogin[Render /login PIN view]
```
