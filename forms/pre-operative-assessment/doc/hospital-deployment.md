# Hospital Deployment Guide

Practical guide for IT teams deploying the Pre-Operative Assessment system in a hospital environment.

## Prerequisites

### Infrastructure Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Server | Any machine capable of running Node.js 18+ | Linux server or container (Docker) |
| CPU | 1 core | 2+ cores |
| RAM | 512 MB | 1 GB |
| Disk | 100 MB | 500 MB (with logs) |
| Node.js | 18.x | 20.x LTS or 22.x LTS |
| Network | Hospital intranet access | HTTPS-terminated reverse proxy |

### Software Dependencies

The application is built with:
- **SvelteKit** (Node.js server-side rendering)
- **pdfmake** (server-side PDF generation)
- All dependencies are bundled at build time

---

## Deployment Options

### Option 1: Node.js Direct (Simplest)

```bash
# Build the production application
npm run build

# Start the production server
node build/index.js
```

The server listens on port 3000 by default. Set the `PORT` environment variable to change this:

```bash
PORT=8080 node build/index.js
```

### Option 2: Docker Container

Create a `Dockerfile`:

```dockerfile
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
ENV PORT=3000
EXPOSE 3000
CMD ["node", "build/index.js"]
```

```bash
docker build -t preop-assessment .
docker run -p 3000:3000 preop-assessment
```

### Option 3: Behind Reverse Proxy (Recommended for Production)

Deploy behind Nginx, Apache, or a hospital load balancer for TLS termination, access control, and logging.

Example Nginx configuration:

```nginx
server {
    listen 443 ssl;
    server_name preop.hospital.nhs.uk;

    ssl_certificate     /etc/ssl/certs/hospital.crt;
    ssl_certificate_key /etc/ssl/private/hospital.key;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name preop.hospital.nhs.uk;
    return 301 https://$host$request_uri;
}
```

---

## SvelteKit Adapter

The default build uses `@sveltejs/adapter-auto`, which detects the deployment platform. For specific platforms:

### Node.js Server (Recommended)

```bash
npm install -D @sveltejs/adapter-node
```

Update `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-node';

export default {
    kit: {
        adapter: adapter({
            out: 'build',
            precompress: true
        })
    }
};
```

### Static Hosting (Limited)

The PDF generation endpoint requires server-side Node.js, so fully static deployment is not possible. However, the questionnaire UI could be deployed statically with the PDF endpoint hosted separately.

---

## Network and Security Configuration

### HTTPS

**HTTPS is mandatory for production deployment.** The system handles patient health data (special category under GDPR / PHI under HIPAA).

Options:
1. TLS termination at the reverse proxy (recommended)
2. TLS directly in Node.js (using `https` module)
3. Hospital VPN/network that provides transport encryption

### Firewall Rules

| Direction | Port | Protocol | Purpose |
|-----------|------|----------|---------|
| Inbound | 443 (HTTPS) | TCP | User access |
| Inbound | 80 (HTTP) | TCP | Redirect to HTTPS only |
| Outbound | None required | - | The system makes no outbound connections |

The system has **no external dependencies at runtime**. It does not connect to external APIs, databases, or cloud services. All processing is local.

### Access Control

The system itself does not implement user authentication. Access control should be managed at the network/infrastructure level:

| Method | Suitable For |
|--------|-------------|
| Hospital network only (no internet access) | Simplest; relies on physical network security |
| IP allowlisting | Restrict to specific subnets (e.g., pre-op clinic) |
| Reverse proxy authentication | HTTP Basic, LDAP, Active Directory integration |
| Hospital SSO integration | SAML, OAuth2 via identity provider |
| VPN access | For remote/multi-site access |

---

## Tablet Configuration for Waiting Rooms

The system is designed for tablet use in waiting rooms. Recommended setup:

### iPad Configuration

1. Open Safari and navigate to the system URL.
2. Add to Home Screen for full-screen app-like experience.
3. Enable Guided Access (Settings > Accessibility > Guided Access) to lock the tablet to the browser.
4. Disable Safari navigation controls in Guided Access.
5. Set auto-lock to 10 minutes.
6. Use a secure case with a stand for waiting room placement.

### Android Tablet Configuration

1. Open Chrome and navigate to the system URL.
2. Use a kiosk/lockdown app (e.g., SureLock, Kiosk Browser) to restrict the tablet to the assessment URL.
3. Disable navigation bar and status bar.
4. Set screen timeout appropriately.

### General Tablet Recommendations

| Setting | Value | Reason |
|---------|-------|--------|
| Screen brightness | 70-80% | Readable in clinic lighting |
| Auto-lock timeout | 10 minutes | Balance between battery life and usability |
| Orientation lock | Portrait | Consistent layout |
| Volume | Muted | Clinical environment |
| Notifications | Disabled | Prevent distracting popups |
| Auto-updates | Disabled during clinic hours | Prevent interruptions |
| Screen protector | Anti-glare, privacy | Reduce shoulder-surfing, glare |

---

## Monitoring and Logging

### Health Check

The application serves the landing page at `/`. A simple HTTP health check can verify availability:

```bash
curl -s -o /dev/null -w "%{http_code}" https://preop.hospital.nhs.uk/
# Expected: 200
```

### Process Management

Use a process manager for automatic restart:

```bash
# Using PM2
npm install -g pm2
pm2 start build/index.js --name preop-assessment
pm2 save
pm2 startup  # Configure auto-start on boot
```

### Log Management

Node.js logs to stdout/stderr. Configure your process manager or container runtime to capture and rotate logs:

```bash
# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

---

## Backup and Recovery

### What Needs Backing Up

The system has **no persistent data store**. The only items to back up are:

| Item | Location | Frequency |
|------|----------|-----------|
| Application code | Source repository (Git) | Per deployment |
| Configuration files | Server file system | Per change |
| TLS certificates | Certificate store | Per renewal |
| Reverse proxy config | Server file system | Per change |

### Recovery Procedure

1. Provision a new server (or container).
2. Clone the application repository.
3. Run `npm ci && npm run build`.
4. Configure the reverse proxy and TLS.
5. Start the application.
6. Verify health check passes.

Recovery time objective: under 1 hour with documented procedures.

---

## Integration Considerations

### Electronic Health Record (EHR) Integration

The system currently operates standalone. Potential integration points:

| Integration | Mechanism | Complexity |
|---|---|---|
| Pre-populate demographics from PAS/EHR | API call on page load | Medium |
| Export PDF to document management system | Automated file upload or API | Medium |
| HL7 FHIR QuestionnaireResponse | Standard healthcare interoperability | High |
| EPR direct data write | Custom integration per EPR vendor | High |

### Printing

The system supports:
- **Browser print** via the Print button (uses print-friendly CSS)
- **PDF download** for saving or printing from any device
- **Network printer** access depends on the device and hospital network configuration

---

## Upgrade Procedure

1. **Announce maintenance window** (system has no persistent state, so brief downtime is low-impact).
2. Pull latest code from repository.
3. Run `npm ci` to update dependencies.
4. Run `npm run build` to rebuild the application.
5. Run `npx vitest run` to verify tests pass.
6. Restart the application process.
7. Verify health check.
8. Test a sample assessment end-to-end.

Zero-downtime upgrades are possible with blue-green deployment or container orchestration (Kubernetes).

---

## Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Page loads but no styles | Tailwind CSS not built | Rebuild with `npm run build` |
| PDF download fails | Server-side pdfmake error | Check server logs for errors; verify Node.js version |
| "Cannot connect" on tablet | Network/firewall issue | Verify tablet can reach server; check firewall rules |
| Assessment data lost on page refresh | Expected behaviour | Data lives in browser memory only; this is by design |
| Slow page loads | Server resource constraints | Increase server resources or enable pre-compression |
| 502 Bad Gateway | Application crashed | Check process manager; restart application |
