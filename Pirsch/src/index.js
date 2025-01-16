export default {
    async fetch(request, env, ctx) {
        return await handleRequest(request, env);
    },
};
// handle request
async function handleRequest(request, env) {
    const url = new URL(request.url);

    // Extract the domain from the query parameters
    const domain = url.searchParams.get("domain");
    console.log("Domain from query:", domain);

    if (!domain) {
        return new Response("Domain not provided", { status: 400 });
    }

    // Normalize domain (remove 'www.') and format for environment variable lookup
    const normalizedDomain = domain.replace(/^www\./, ""); // Remove 'www.'
    const formattedDomain = normalizedDomain.replace(/\./g, "_").toUpperCase();
    console.log("Formatted Domain:", formattedDomain);

    // Retrieve the access key from environment variables
    const accessKey = env[`PIRSH_${formattedDomain}_KEY`];
    console.log("Access Key:", accessKey ? "Found" : "Not Found");

    if (!accessKey) {
        return new Response(`Access key not found for domain: ${formattedDomain}`, { status: 403 });
    }

    // Route handling
    const path = url.pathname;

    if (path === "/p/pv") {
        return await handlePageView(request, accessKey);
    } else if (path === "/p/e") {
        return await handleEvent(request, accessKey);
    } else if (path === "/p/s") {
        return await handleSession(request, accessKey);
    } else if (path === "/static/files/pa.js") {
        return await getScript(request, "https://api.pirsch.io/pa.js");
    } else {
        return new Response("Not Found", { status: 404 });
    }
}

async function handlePageView(request, accessKey) {
    try {
        const url = new URL(request.url);
        const queryParams = url.searchParams;

        // Construct the payload for Pirsch API
        const payload = {
            url: queryParams.get("url"),
            code: queryParams.get("code"),
            ip: request.headers.get("CF-Connecting-IP"),
            user_agent: request.headers.get("User-Agent"),
            referrer: queryParams.get("ref"),
            screen_width: Number(queryParams.get("w")),
            screen_height: Number(queryParams.get("h")),
        };

        console.log("Payload sent to Pirsch:", payload);

        // Send data to Pirsch
        const response = await fetch("https://api.pirsch.io/api/v1/hit", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error(`Pirsch API error: ${response.statusText}`);
            throw new Error(`Pirsch API responded with status: ${response.status}`);
        }

        return new Response("Success", { status: 200 });
    } catch (error) {
        console.error("Error in handlePageView:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

async function handleEvent(request, accessKey) {
    try {
        const requestBody = await request.json();
        const response = await fetch("https://api.pirsch.io/api/v1/event", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Pirsch API responded with status: ${response.status}`);
        }

        return new Response("Event logged successfully", { status: 200 });
    } catch (error) {
        console.error("Error in handleEvent:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

async function handleSession(request, accessKey) {
    try {
        const requestBody = await request.json();
        const response = await fetch("https://api.pirsch.io/api/v1/session", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Pirsch API responded with status: ${response.status}`);
        }

        return new Response("Session logged successfully", { status: 200 });
    } catch (error) {
        console.error("Error in handleSession:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

async function getScript(request, scriptURL) {
    const cache = caches.default;
    let response = await cache.match(request);

    if (!response) {
        response = await fetch(scriptURL);
        if (response.ok) {
            await cache.put(request, response.clone());
        }
    }

    return new Response(response.body, {
        headers: {
            "Content-Type": "application/javascript",
            "Cache-Control": "max-age=31536000, immutable",
        },
    });
}