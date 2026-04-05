async function fetchTargetData(phoneInput) {
    const targetUrl = `https://paid.proportalxc.workers.dev/number?key=1kSubscriber&num=${encodeURIComponent(phoneInput)}`;
    const encodedUrl = encodeURIComponent(targetUrl);
    
    // Array of 5 robust public CORS proxies for automatic failover
    const proxies = [
        { url: `https://corsproxy.io/?${encodedUrl}`, type: 'direct' },
        { url: `https://api.codetabs.com/v1/proxy?quest=${targetUrl}`, type: 'direct' },
        { url: `https://api.allorigins.win/get?url=${encodedUrl}`, type: 'wrapped' },
        { url: `https://api.allorigins.win/raw?url=${encodedUrl}`, type: 'direct' },
        { url: `https://thingproxy.freeboard.io/fetch/${targetUrl}`, type: 'direct' }
    ];

    let lastError = null;

    // Loop through the proxies sequentially
    for (let i = 0; i < proxies.length; i++) {
        const proxy = proxies[i];
        
        try {
            console.log(`Attempting connection via Proxy ${i + 1}...`);
            
            // 5-SECOND KILL SWITCH: Aborts the request if the proxy is dead/slow
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(proxy.url, { 
                method: 'GET',
                signal: controller.signal 
            });
            
            // Clear the timeout if we get a response in time
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Proxy returned HTTP ${response.status}`);
            }

            const data = await response.json();

            // AllOrigins '/get' wraps the data inside a 'contents' string, so we parse it
            if (proxy.type === 'wrapped') {
                if (!data.contents) throw new Error("Empty wrapper response");
                return JSON.parse(data.contents);
            }

            // Return direct JSON data
            return data;

        } catch (error) {
            console.warn(`Proxy ${i + 1} failed or timed out. Auto-switching to next... (${error.message})`);
            lastError = error;
            continue; // Move to the next proxy in the array
        }
    }

    // If all 5 proxies fail, throw a final error to the user
    throw new Error(`All global proxy nodes are currently congested. Please try again in a few moments.`);
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
            
            // Filter out developer footprints
            if (kStr.includes('developer') || kStr.includes('proportalx') || vStr.includes('@proportalx') || kStr.includes('channel') || vStr === '@') continue;

            const fKey = key.replace(/([A-Z])/g, ' $1').toUpperCase().replace(/_/g, ' ');
            
            if (value !== null && typeof value === 'object') {
                const fDiv = document.createElement('div');
                fDiv.className = 'nested-folder glass-panel';
                
                // SPEED FIX: Dropped delay from 0.1s to 0.02s for lightning fast rendering
                fDiv.style.animationDelay = `${delay}s`;
                delay += 0.02; 
                
                fDiv.innerHTML = `<div class="folder-title">${fKey}</div>`;
                const sGrid = document.createElement('div');
                sGrid.className = 'grid-container';
                parseData(value, sGrid);
                fDiv.appendChild(sGrid);
                container.appendChild(fDiv);
            } else {
                const card = document.createElement('div');
                card.className = 'data-card glass-panel';
                
                // SPEED FIX: Dropped delay from 0.05s to 0.015s
                card.style.animationDelay = `${delay}s`;
                delay += 0.015; 
                
                card.innerHTML = `<div class="card-label">${fKey}</div><div class="card-value">${(value !== null && value !== '') ? value : 'N/A'}</div>`;
                container.appendChild(card);
            }
        }
    }
    parseData(data, mainGrid);
}
