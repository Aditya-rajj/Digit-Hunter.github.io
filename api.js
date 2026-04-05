// Universal API routing dictionary
const API_ROUTES = {
    'number': 'https://paid.proportalx.workers.dev/number?key=1kSubscriber&num=',
    'vehicle': 'https://paid.proportalx.workers.dev/vehicle?key=1kSubscriber&rc=',
    'aadhar': 'https://paid.proportalx.workers.dev/aadhar?key=1kSubscriber&aadhar=',
    'family': 'https://paid.proportalx.workers.dev/family?key=1kSubscriber&id=',
    'tg': 'https://paid.proportalx.workers.dev/tg?key=1kSubscriber&username=',
    'ifsc': 'https://paid.proportalx.workers.dev/ifsc?key=1kSubscriber&code=',
    'ip': 'https://paid.proportalx.workers.dev/ip?key=1kSubscriber&ip=',
    'pincode': 'https://paid.proportalx.workers.dev/pincode?key=1kSubscriber&pincode=',
    'gst': 'https://paid.proportalx.workers.dev/gst?key=1kSubscriber&gst='
};

async function fetchTargetData(toolId, inputValue) {
    // Dynamically build the URL based on which tool the user clicked
    const baseUrl = API_ROUTES[toolId];
    if (!baseUrl) throw new Error("Critical Error: API Route Not Found.");

    const targetUrl = baseUrl + encodeURIComponent(inputValue);
    const encodedUrl = encodeURIComponent(targetUrl);
    
    // Auto-failover proxy system
    const proxies = [
        { url: `https://corsproxy.io/?${encodedUrl}`, type: 'direct' },
        { url: `https://api.codetabs.com/v1/proxy?quest=${targetUrl}`, type: 'direct' },
        { url: `https://api.allorigins.win/get?url=${encodedUrl}`, type: 'wrapped' },
        { url: `https://api.allorigins.win/raw?url=${encodedUrl}`, type: 'direct' },
        { url: `https://thingproxy.freeboard.io/fetch/${targetUrl}`, type: 'direct' }
    ];

    let lastError = null;

    for (let i = 0; i < proxies.length; i++) {
        const proxy = proxies[i];
        try {
            console.log(`Connecting via routing node ${i + 1}...`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 Sec timeout

            const response = await fetch(proxy.url, { method: 'GET', signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`Node HTTP ${response.status}`);

            const data = await response.json();

            if (proxy.type === 'wrapped') {
                if (!data.contents) throw new Error("Empty wrapper");
                return JSON.parse(data.contents);
            }
            return data;

        } catch (error) {
            console.warn(`Node ${i + 1} bypassed: ${error.message}`);
            lastError = error;
            continue; 
        }
    }
    throw new Error(`All global proxy nodes congested. Please retry.`);
}

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = '';
    
    const mainGrid = document.createElement('div');
    mainGrid.className = 'grid-container';
    resultsDiv.appendChild(mainGrid);
    
    let delay = 0;

    function parseData(obj, container) {
        for (const [key, value] of Object.entries(obj)) {
            const kStr = key.toLowerCase();
            const vStr = (typeof value === 'string') ? value.trim().toLowerCase() : '';
            
            if (kStr.includes('developer') || kStr.includes('proportalx') || vStr.includes('@proportalx') || kStr.includes('channel') || vStr === '@') continue;

            const fKey = key.replace(/([A-Z])/g, ' $1').toUpperCase().replace(/_/g, ' ');
            
            if (value !== null && typeof value === 'object') {
                const fDiv = document.createElement('div');
                fDiv.className = 'nested-folder glass-panel';
                fDiv.style.animationDelay = `${delay}s`;
                delay += 0.05;
                fDiv.innerHTML = `<div class="folder-title">${fKey}</div>`;
                const sGrid = document.createElement('div');
                sGrid.className = 'grid-container';
                parseData(value, sGrid);
                fDiv.appendChild(sGrid);
                container.appendChild(fDiv);
            } else {
                const card = document.createElement('div');
                card.className = 'data-card glass-panel';
                card.style.animationDelay = `${delay}s`;
                delay += 0.02; 
                card.innerHTML = `<div class="card-label">${fKey}</div><div class="card-value">${(value !== null && value !== '') ? value : 'N/A'}</div>`;
                container.appendChild(card);
            }
        }
    }
    parseData(data, mainGrid);
}
