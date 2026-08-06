# DNS snapshot — vacanzagreece.gr

Captured 2026-08-06 from the Papaki zone, **before** moving nameservers to Cloudflare.
Recreate every row below in Cloudflare and verify it **before** changing nameservers at Papaki.

Registrar: Papaki · Current nameservers: `dns1.papaki.gr`, `dns2.papaki.gr`
Domain expires 2027-08-20, auto-renewal active.

**Verified complete against the Papaki panel on 2026-08-06.** 16 records to recreate:
3 A + 7 CNAME + 2 MX + 4 TXT. Papaki also lists 2 NS and 1 SOA record — **do not copy those**,
Cloudflare generates its own.

## Website (A records)

| Type | Name | Value | Proxy status in Cloudflare |
|------|------|-------|-----------------------------|
| A | `@` | `136.144.201.33` | **DNS only (grey cloud)** |
| A | `www` | `136.144.201.33` | **DNS only (grey cloud)** |
| A | `admin` | `136.144.201.33` | **DNS only (grey cloud)** |

Grey cloud keeps behaviour byte-identical to today. Proxying can be enabled later, deliberately.

## Mail routing (MX)

| Type | Name | Value | Priority |
|------|------|-------|----------|
| MX | `@` | `mx1.hostinger.com` | 5 |
| MX | `@` | `mx2.hostinger.com` | 10 |

## Mail authentication — DKIM (CNAME)

All 7 verified resolving on 2026-08-06. **Invisible to external probing — only the zone file reveals these.**

| Name | Value |
|------|-------|
| `hostingermail-a._domainkey` | `hostingermail-a.dkim.mail.hostinger.com` |
| `hostingermail-b._domainkey` | `hostingermail-b.dkim.mail.hostinger.com` |
| `hostingermail-c._domainkey` | `hostingermail-c.dkim.mail.hostinger.com` |
| `reach-a._domainkey` | `reach-a.dkim.reach.hostinger.com` |
| `reach-b._domainkey` | `reach-b.dkim.reach.hostinger.com` |
| `reach-a.dkim.reach.hostinger.com` | `reach-a.dkim.reach.hostinger.com` |
| `reach-b.dkim.reach.hostinger.com` | `reach-b.dkim.reach.hostinger.com` |

The last two are malformed — a full hostname was pasted into a field that auto-appends the domain,
producing `reach-a.dkim.reach.hostinger.com.vacanzagreece.gr`. Nothing queries them; they are inert.
Copy them anyway to keep the migration a clean 1:1.

All 7 DKIM CNAMEs must be **DNS only (grey cloud)** in Cloudflare. A proxied CNAME is rewritten
to point at Cloudflare's edge, which breaks DKIM lookups and silently fails your mail signing.

## TXT — SPF, DMARC and verification

| Name | Value |
|------|-------|
| `@` | `v=spf1 include:_spf.mail.hostinger.com include:_spf.reach.hostinger.com ~all` |
| `@` | `317a22d7d3cda70bb5d95e0b6b888cc0` |
| `@` | `google-site-verification=xZove2ZCWNJ91E-bDj0JqRHU17YFdPHNjj1Lgg-a8IY` |
| `_dmarc` | `v=DMARC1; p=none` |

Papaki confirms 0 AAAA and 0 SRV records. No CAA, no apex CNAME.

## Records NOT to copy

Papaki lists these; Cloudflare creates its own and will reject or ignore yours:

| Type | Value |
|------|-------|
| NS | `dns1.papaki.gr`, `dns2.papaki.gr` |
| SOA | `dns1.papaki.gr support.papaki.gr 2026061402 10800 3600 1209600 3600` |

## Why this matters

`info@vacanzagreece.gr` receives user reports from the app (`sendMail` in
`src/main/chat/chat.service.ts`). Dropping MX silently loses those. Dropping SPF or the DKIM
CNAMEs sends your outbound mail to spam — and that failure is quiet, so you would not notice
for days.

## Order of operations

1. Papaki → DNS → **Show all** → capture the complete list. Change nothing.
2. Cloudflare → Domains → Add a domain → `vacanzagreece.gr` → Free plan. Let it auto-import.
3. **Diff the import against this file and the Papaki list.** Add whatever is missing by hand.
   Cloudflare's scanner routinely misses DKIM CNAMEs.
4. Set all three A records to DNS only (grey cloud).
5. Papaki → Nameservers → replace with the two Cloudflare nameservers.
6. Wait for Cloudflare to report the zone Active (usually 10–60 min).
7. Verify — do not skip, "Active" only means delegation succeeded, not that mail works:
   ```
   nslookup -type=MX vacanzagreece.gr 8.8.8.8
   nslookup -type=TXT vacanzagreece.gr 8.8.8.8
   nslookup -type=CNAME hostingermail-a._domainkey.vacanzagreece.gr 8.8.8.8
   ```
   Load https://vacanzagreece.gr and https://admin.vacanzagreece.gr
   Send a test email **to** `info@vacanzagreece.gr` and confirm it arrives.
   Send one **from** it and confirm it does not land in spam.
8. Only then: R2 → `vacanza-media` → Settings → Custom Domains → `cdn.vacanzagreece.gr`.

## Nameservers

| | |
|---|---|
| Original (Papaki) | `dns1.papaki.gr`, `dns2.papaki.gr` |
| Cloudflare (assigned 2026-08-06) | `harley.ns.cloudflare.com`, `zelda.ns.cloudflare.com` |

DNSSEC was verified **not enabled** before the switch — no DS record at the `.gr` registry and no
DNSKEY, so no need to disable it first. If DNSSEC is ever enabled later, it must be turned off
before any future nameserver change or the domain fails validation and goes fully offline.

**Rollback:** set nameservers back to `dns1.papaki.gr` / `dns2.papaki.gr`. The Papaki zone records
are left in place and untouched throughout, so this returns you exactly to today's state within
minutes. Do not delete them at Papaki after the migration.

## R2 facts for later steps

- Bucket: `vacanza-media`, jurisdiction **European Union (EU)**
- S3 endpoint (note the `.eu` segment — the generic form will NOT work):
  `https://4ba5037d53cfef709ebe081660ebf9f6.eu.r2.cloudflarestorage.com`
- Public base URL once the custom domain is live: `https://cdn.vacanzagreece.gr`
