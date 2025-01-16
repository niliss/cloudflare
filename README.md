# Pirsch Analytics via Cloudflare Workers

Integrate Pirsch Analytics with Cloudflare Workers for Webflow or Zaraz.

## Instructions

Add this script to your `<head>`:
```html
<script>
  (function () {
    const domain = location.hostname, nc = Date.now();
    const script = document.createElement('script');
    script.defer = true;
    script.src = `https://<YOUR_WORKER>.workers.dev/static/files/pa.js?domain=${domain}&nc=${nc}`;
    script.id = 'pianjs';
    script.setAttribute('data-code', 'YOUR_TRACKING_CODE'); // Replace with your Pirsch key
    script.setAttribute('data-hit-endpoint', `https://<YOUR_WORKER>.workers.dev/p/pv?domain=${domain}&nc=${nc}`);
    script.setAttribute('data-event-endpoint', `https://<YOUR_WORKER>.workers.dev/p/e?domain=${domain}&nc=${nc}`);
    script.setAttribute('data-session-endpoint', `https://<YOUR_WORKER>.workers.dev/p/s?domain=${domain}&nc=${nc}`);
    document.head.appendChild(script);
  })();
</script>


Replace `<YOUR_WORKER>` with your Worker subdomain (e.g., `pirsch.niels-c1e`) and `YOUR_TRACKING_CODE` with the Pirsch key for your domain.

For Zaraz, add the same script in **Zaraz Custom Scripts** in your Cloudflare settings.

## Testing
1. Open your site and inspect the **Network** tab for `/static/files/pa.js` or `/p/pv`.
2. Tail Worker logs:
   ```bash
   wrangler tail


Logs should confirm the domain and key are found. Verify data in the Pirsch dashboard.

## Adding Domains
1. Update `wrangler.toml` with the domain key:
   ```toml
   [vars]
   PIRSH_NEW_DOMAIN_COM_KEY = "your_new_tracking_key"

2. Deploy the Worker:
   ```bash
   wrangler deploy


## Folder Structure

cloudflare/
├── pirsch/
│   ├── index.js           # Cloudflare Worker script
│   ├── wrangler.toml      # Worker configuration
│   ├── README.md          # This file