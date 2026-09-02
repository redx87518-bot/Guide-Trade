const { Client, Databases } = require('appwrite');

const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT_ID = '6a980c230037eb465e11';
const DATABASE_ID = 'guide_trade';
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
    console.error('APPWRITE_API_KEY not set');
    process.exit(1);
}

const headers = {
    'X-Appwrite-Project': PROJECT_ID,
    'X-Appwrite-Key': API_KEY,
    'X-Appwrite-Response-Format': '1.7.5',
    'Content-Type': 'application/json'
};

const baseUrl = `${ENDPOINT}`;

async function api(path, method = 'GET', body = null) {
    const options = {
        method,
        headers,
        redirect: 'manual'
    };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(`${baseUrl}${path}`, options);
    if (!res.ok) {
        const text = await res.text();
        console.error(`❌ ${path}: ${res.status} - ${text.substring(0, 200)}`);
        return null;
    }
    return await res.json();
}

async function apiRaw(path, method, body) {
    const options = {
        method,
        headers: {
            ...headers,
            'Content-Type': undefined
        },
        redirect: 'manual'
    };
    // Build query string for GET with params
    return api(path, method, body);
}

const COLLECTIONS = {
    profiles: {
        name: 'User Profiles',
        attributes: [
            { type: 'string', key: 'userId', size: 36, required: true },
            { type: 'string', key: 'name', size: 255, required: false },
            { type: 'email', key: 'email', required: false },
            { type: 'url', key: 'avatarUrl', required: false },
        ],
        indexes: [
            { key: 'userId_idx', type: 'key', attributes: ['userId'] },
        ]
    },
    watchlists: {
        name: 'Watchlists',
        attributes: [
            { type: 'string', key: 'userId', size: 36, required: true },
            { type: 'string', key: 'name', size: 255, required: true },
            { type: 'string', key: 'symbols', size: 50, required: false, array: true },
            { type: 'datetime', key: 'createdAt', required: true },
        ],
        indexes: [
            { key: 'userId_idx', type: 'key', attributes: ['userId'] },
        ]
    },
    research_sessions: {
        name: 'Research Sessions',
        attributes: [
            { type: 'string', key: 'userId', size: 36, required: true },
            { type: 'string', key: 'query', size: 1000, required: true },
            { type: 'string', key: 'status', size: 50, required: true },
            { type: 'datetime', key: 'startedAt', required: false },
            { type: 'datetime', key: 'completedAt', required: false },
        ],
        indexes: [
            { key: 'userId_idx', type: 'key', attributes: ['userId'] },
            { key: 'status_idx', type: 'key', attributes: ['status'] },
            { key: 'userId_status_idx', type: 'key', attributes: ['userId', 'status'] },
        ]
    },
    research_results: {
        name: 'Research Results',
        attributes: [
            { type: 'string', key: 'userId', size: 36, required: true },
            { type: 'string', key: 'sessionId', size: 36, required: false },
            { type: 'string', key: 'symbol', size: 20, required: false },
            { type: 'string', key: 'title', size: 500, required: false },
            { type: 'text', key: 'summary', required: false },
            { type: 'text', key: 'bullishFactors', required: false, array: true },
            { type: 'text', key: 'bearishFactors', required: false, array: true },
            { type: 'text', key: 'risks', required: false, array: true },
            { type: 'text', key: 'outlook', required: false },
            { type: 'string', key: 'confidence', size: 20, required: false },
            { type: 'text', key: 'sources', required: false },
            { type: 'datetime', key: 'createdAt', required: true },
        ],
        indexes: [
            { key: 'userId_idx', type: 'key', attributes: ['userId'] },
            { key: 'sessionId_idx', type: 'key', attributes: ['sessionId'] },
            { key: 'symbol_idx', type: 'key', attributes: ['symbol'] },
            { key: 'userId_createdAt_idx', type: 'sort', attributes: ['userId', 'createdAt'] },
        ]
    },
    saved_reports: {
        name: 'Saved Reports',
        attributes: [
            { type: 'string', key: 'userId', size: 36, required: true },
            { type: 'string', key: 'researchId', size: 36, required: false },
            { type: 'string', key: 'title', size: 500, required: false },
            { type: 'string', key: 'fileId', size: 255, required: false },
            { type: 'datetime', key: 'createdAt', required: true },
        ],
        indexes: [
            { key: 'userId_idx', type: 'key', attributes: ['userId'] },
            { key: 'researchId_idx', type: 'key', attributes: ['researchId'] },
        ]
    },
    user_settings: {
        name: 'User Settings',
        attributes: [
            { type: 'string', key: 'userId', size: 36, required: true },
            { type: 'boolean', key: 'voiceEnabled', required: false, default: false },
            { type: 'boolean', key: 'autoReadResearch', required: false, default: false },
            { type: 'string', key: 'elevenLabsApiKey', size: 255, required: false },
            { type: 'string', key: 'elevenLabsVoiceId', size: 255, required: false },
            { type: 'boolean', key: 'telegramEnabled', required: false, default: false },
            { type: 'string', key: 'telegramBotToken', size: 255, required: false },
            { type: 'string', key: 'telegramChatId', size: 255, required: false },
            { type: 'boolean', key: 'discordEnabled', required: false, default: false },
            { type: 'string', key: 'discordWebhookUrl', size: 500, required: false },
        ],
        indexes: [
            { key: 'userId_idx', type: 'key', attributes: ['userId'] },
        ]
    },
    notifications: {
        name: 'Notifications',
        attributes: [
            { type: 'string', key: 'userId', size: 36, required: true },
            { type: 'string', key: 'type', size: 50, required: true },
            { type: 'string', key: 'title', size: 255, required: true },
            { type: 'text', key: 'message', required: true },
            { type: 'boolean', key: 'read', required: true, default: false },
            { type: 'datetime', key: 'createdAt', required: true },
        ],
        indexes: [
            { key: 'userId_idx', type: 'key', attributes: ['userId'] },
            { key: 'read_idx', type: 'key', attributes: ['read'] },
            { key: 'userId_read_idx', type: 'key', attributes: ['userId', 'read'] },
        ]
    }
};

async function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function createAttribute(dbId, colId, attr) {
    const params = new URLSearchParams();
    params.set('attributeId', attr.key);
    params.set('required', attr.required ? 'true' : 'false');
    if (attr.array) params.set('array', 'true');
    if (attr.default !== undefined) params.set('default', JSON.stringify(attr.default));
    
    let path;
    if (attr.type === 'string') {
        path = `/v1/database/collections/${colId}/attributes/string?databaseId=${dbId}&attributeId=${attr.key}&size=${attr.size}&required=${attr.required ? 'true' : 'false'}`;
        if (attr.array) path += '&array=true';
    } else if (attr.type === 'email') {
        path = `/v1/database/collections/${colId}/attributes/email?databaseId=${dbId}&attributeId=${attr.key}&required=${attr.required ? 'true' : 'false'}`;
    } else if (attr.type === 'url') {
        path = `/v1/database/collections/${colId}/attributes/url?databaseId=${dbId}&attributeId=${attr.key}&required=${attr.required ? 'true' : 'false'}`;
    } else if (attr.type === 'text') {
        path = `/v1/database/collections/${colId}/attributes/text?databaseId=${dbId}&attributeId=${attr.key}&required=${attr.required ? 'true' : 'false'}`;
        if (attr.array) path += '&array=true';
    } else if (attr.type === 'datetime') {
        path = `/v1/database/collections/${colId}/attributes/datetime?databaseId=${dbId}&attributeId=${attr.key}&required=${attr.required ? 'true' : 'false'}`;
    } else if (attr.type === 'boolean') {
        path = `/v1/database/collections/${colId}/attributes/boolean?databaseId=${dbId}&attributeId=${attr.key}&required=${attr.required ? 'true' : 'false'}`;
        if (attr.default !== undefined) path += `&default=${attr.default}`;
    } else if (attr.type === 'integer') {
        path = `/v1/database/collections/${colId}/attributes/integer?databaseId=${dbId}&attributeId=${attr.key}&required=${attr.required ? 'true' : 'false'}`;
    } else if (attr.type === 'float') {
        path = `/v1/database/collections/${colId}/attributes/float?databaseId=${dbId}&attributeId=${attr.key}&required=${attr.required ? 'true' : 'false'}`;
    }
    
    const res = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
            'X-Appwrite-Project': PROJECT_ID,
            'X-Appwrite-Key': API_KEY,
            'X-Appwrite-Response-Format': '1.7.5',
        }
    });
    
    if (!res.ok) {
        const text = await res.text();
        if (res.status === 409) {
            console.log(`  ⚠ ${attr.key}: already exists, skipping`);
        } else {
            console.log(`  ❌ ${attr.key}: ${res.status} - ${text.substring(0, 150)}`);
        }
        return false;
    }
    console.log(`  ✓ ${attr.key} (${attr.type}${attr.array ? '[]' : ''})`);
    return true;
}

async function createIndex(dbId, colId, index) {
    const params = new URLSearchParams();
    params.set('databaseId', dbId);
    params.set('collectionId', colId);
    params.set('key', index.key);
    params.set('type', index.type);
    params.set('attributes', JSON.stringify(index.attributes));
    
    const res = await fetch(`${baseUrl}/v1/database/indexes?${params.toString()}`, {
        method: 'POST',
        headers: {
            'X-Appwrite-Project': PROJECT_ID,
            'X-Appwrite-Key': API_KEY,
            'X-Appwrite-Response-Format': '1.7.5',
        }
    });
    
    if (!res.ok) {
        const text = await res.text();
        if (res.status === 409) {
            console.log(`  ⚠ Index ${index.key}: already exists, skipping`);
        } else if (res.status === 202) {
            console.log(`  ✓ Index ${index.key}: created (processing)`);
        } else {
            console.log(`  ❌ Index ${index.key}: ${res.status} - ${text.substring(0, 150)}`);
        }
        return false;
    }
    console.log(`  ✓ Index ${index.key} (${index.type})`);
    return true;
}

async function setCollectionPermissions(dbId, colId) {
    // Set collection-level read/write permissions for authenticated users
    const perms = [
        'read("any")',
        'write("any")',
        'create("any")',
        'update("any")',
        'delete("any")'
    ];
    
    // For Appwrite, permissions are set via PATCH /v1/database/collections/{collectionId}?databaseId={databaseId}
    const res = await fetch(`${baseUrl}/v1/database/collections/${colId}?databaseId=${dbId}`, {
        method: 'PATCH',
        headers: {
            'X-Appwrite-Project': PROJECT_ID,
            'X-Appwrite-Key': API_KEY,
            'X-Appwrite-Response-Format': '1.7.5',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions: perms })
    });
    
    if (res.ok) {
        console.log(`  ✓ Permissions set for ${colId}`);
    } else {
        const text = await res.text();
        console.log(`  ⚠ Permissions for ${colId}: ${res.status} - ${text.substring(0, 100)}`);
    }
}

async function main() {
    console.log('=== SCHEMA SETUP FOR GUIDE TRADE DATABASE ===\n');
    
    for (const [colId, config] of Object.entries(COLLECTIONS)) {
        console.log(`Collection: ${colId} (${config.name})`);
        
        // Create attributes
        console.log('  Attributes:');
        for (const attr of config.attributes) {
            await createAttribute(DATABASE_ID, colId, attr);
            await wait(200);
        }
        
        // Create indexes
        console.log('  Indexes:');
        for (const idx of config.indexes) {
            await createIndex(DATABASE_ID, colId, idx);
            await wait(200);
        }
        
        console.log('');
    }
    
    console.log('=== SCHEMA SETUP COMPLETE ===');
    process.exit(0);
}

main().catch(e => {
    console.error('Fatal error:', e.message);
    process.exit(1);
});
