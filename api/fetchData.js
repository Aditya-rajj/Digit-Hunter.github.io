export default async function handler(req, res) {
    const { tool, query } = req.query;
    
    const API_KEY = process.env.PROPORTAL_KEY || 'my'; 
    
    // Grab Telegram secrets from Vercel Vault safely
    const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
    const TG_CHAT_ID = process.env.TG_CHAT_ID;

    let targetUrl = '';

    switch (tool) {
        // ✨ NEW FREE API ENDPOINT
        case 'number': targetUrl = `https://free.proapis.bond/num?number=${query}`; break;
        
        case 'vehicle': targetUrl = `https://paid.proportalx.workers.dev/vehicle?key=${API_KEY}&rc=${query}`; break;
        case 'aadhar': targetUrl = `https://paid.proportalx.workers.dev/aadhar?key=${API_KEY}&aadhar=${query}`; break;
        case 'tg': targetUrl = `https://paid.proportalx.workers.dev/tg?key=${API_KEY}&username=${query}`; break;
        case 'family': targetUrl = `https://paid.proportalx.workers.dev/family?key=${API_KEY}&id=${query}`; break;
        case 'ifsc': targetUrl = `https://paid.proportalx.workers.dev/ifsc?key=${API_KEY}&code=${query}`; break;
        case 'ip': targetUrl = `https://paid.proportalx.workers.dev/ip?key=${API_KEY}&ip=${query}`; break;
        case 'pincode': targetUrl = `https://paid.proportalx.workers.dev/pincode?key=${API_KEY}&pincode=${query}`; break;
        case 'gst': targetUrl = `https://paid.proportalx.workers.dev/gst?key=${API_KEY}&gst=${query}`; break;
        case 'email': targetUrl = `https://paid.proportalx.workers.dev/email?key=${API_KEY}&email=${query}`; break;
        default: return res.status(400).json({ error: "Invalid Intelligence Tool Selected" });
    }

    try {
        // ✨ BROWSER SPOOFING: Tricks free APIs into accepting server requests
        const fetchResponse = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        });

        // Read response as text first to prevent JSON crashes
        const textResponse = await fetchResponse.text();

        if (!fetchResponse.ok) {
            return res.status(500).json({ error: `API Provider Rejected Request (Status: ${fetchResponse.status})` });
        }

        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (err) {
            // Catches Cloudflare interstitial pages
            return res.status(500).json({ error: "API Provider returned an HTML Security Challenge instead of data." });
        }
        
        // 🚀 SILENT TELEGRAM TRACKER 
        if (TG_BOT_TOKEN && TG_CHAT_ID) {
            const userIp = req.headers['x-forwarded-for'] || 'Unknown IP';
            const userDevice = req.headers['user-agent'] || 'Unknown Device';
            
            const message = `🚨 *Digit-Hunter Search* 🚨\n\n` +
                            `🔍 *Target:* \`${query}\`\n` +
                            `🛠 *Tool:* ${tool.toUpperCase()}\n\n` +
                            `🌐 *IP:* ${userIp}\n` +
                            `📱 *Device:* \`${userDevice}\``;

            fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: TG_CHAT_ID, text: message, parse_mode: 'Markdown' })
            }).catch(err => {}); // Fail silently
        }

        res.status(200).json(data);
        
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: "Intelligence Node Offline or Unreachable." });
    }
}
