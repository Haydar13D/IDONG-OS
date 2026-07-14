# Secure Exposure with Tailscale Serve

This document details how to expose the local containerized IDONG OS application securely over the Tailscale VPN network with automated HTTPS/SSL certificate mappings.

## Prerequisites
1. [Tailscale](https://tailscale.com) installed and authenticated on the deployment server and target client devices.
2. The docker-compose services running locally:
   ```bash
   docker compose up -d
   ```

## Exposing via Tailscale Serve

To securely expose the local Next.js web application (running on port `3000`) over HTTPS to all authorized devices on your Tailscale tailnet:

1. Execute the following command from the host terminal:
   ```bash
   tailscale serve https:443 http://localhost:3000
   ```

2. Tailscale will automatically:
   * Generate valid Let's Encrypt SSL/TLS certificates matching your machine's tailnet domain name (e.g. `https://your-machine.tailnet-name.ts.net`).
   * Route external TLS traffic on port `443` securely into your local container running on port `3000`.

3. To check status and view active mappings:
   ```bash
   tailscale status
   tailscale serve status
   ```

Now, any device connected to your Tailscale tailnet can access your private IDONG OS dashboard securely without exposing ports to the public internet!
