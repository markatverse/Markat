# DNS Backup for markatverse.com
Saved on: October 26, 2026

All active DNS records currently configured for `markatverse.com`:

---

### 1. Nameservers (NS)
| Type | Host / Name | Value / Nameserver | TTL |
| :--- | :--- | :--- | :--- |
| **NS** | `@` | `ns1.vercel-dns.com` | 9877 |
| **NS** | `@` | `ns2.vercel-dns.com` | 9877 |

---

### 2. Email Records (ImprovMX Email Forwarding)
| Type | Host / Name | Priority | Target / Value | TTL |
| :--- | :--- | :--- | :--- | :--- |
| **MX** | `@` | 10 | `mx1.improvmx.com` | 60 |
| **MX** | `@` | 20 | `mx2.improvmx.com` | 60 |
| **TXT** | `@` | - | `v=spf1 include:spf.improvmx.com ~all` | 60 |

---

### 3. Web & Application Records (A Records)
| Type | Host / Subdomain | IP Address / Target | Purpose |
| :--- | :--- | :--- | :--- |
| **A** | `@` (Root) | `64.29.17.1` | Apex Web Domain |
| **A** | `@` (Root) | `216.198.79.1` | Apex Web Domain |
| **A** | `www` | `64.29.17.1` | WWW Subdomain |
| **A** | `www` | `216.198.79.1` | WWW Subdomain |
| **A** | `api` | `64.29.17.1` | API Subdomain |
| **A** | `api` | `216.198.79.1` | API Subdomain |
| **A** | `mail` | `64.29.17.65` | Mail Subdomain |
| **A** | `mail` | `216.198.79.65` | Mail Subdomain |

---

### 4. New Vercel Target Records (For `markat-test` Project)
When you connect `markatverse.com` to your new `markatverse-8973` account on `markat-test`:
* **Apex Web (`@`)**: A Record pointing to `76.76.21.21`
* **WWW Subdomain (`www`)**: CNAME Record pointing to `cname.vercel-dns.com`
* **Backend API (`api`)**: CNAME Record pointing to `cname.vercel-dns.com` (assigned to project `markat-test-9o1f`)
