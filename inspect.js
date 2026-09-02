const { Client, Databases, Functions, Storage, Users } = require('appwrite');

const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT_ID = '6a980c230037eb465e11';
const DATABASE_ID = 'guide_trade';
const FUNCTION_ID = '6a9824b56be83137adf2';
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
    console.error('APPWRITE_API_KEY environment variable not set');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setBearer(API_KEY);

async function main() {
    // === Project Info ===
    console.log('=== Project Info ===');
    try {
        const res = await fetch(`${ENDPOINT}/project`, {
            headers: {
                'X-Appwrite-Project': PROJECT_ID,
                'X-Appwrite-Key': API_KEY,
                'X-Appwrite-Response-Format': '1.7.5',
            }
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2).substring(0, 800));
    } catch(e) {
        console.log('Project info error:', e.message);
    }

    // === Databases ===
    console.log('\n=== Databases ===');
    try {
        const databases = new Databases(client);
        const dbs = await databases.list();
        console.log('Total databases:', dbs.total);
        for (const db of dbs.databases) {
            console.log(`  DB: ${db.name} | ID: ${db.$id} | Created: ${db.$createdAt}`);
        }
    } catch(e) {
        console.log('Databases error:', e.message);
    }

    // === Collections ===
    console.log('\n=== Collections ===');
    try {
        const databases = new Databases(client);
        const collections = await databases.listCollections(DATABASE_ID);
        console.log('Total collections:', collections.total);
        for (const col of collections.collections) {
            console.log(`  Collection: ${col.name} | ID: ${col.$id} | Created: ${col.$createdAt}`);
            // List attributes
            try {
                const attrs = await databases.listAttributes(DATABASE_ID, col.$id);
                for (const attr of attrs.attributes) {
                    const req = attr.required ? 'required' : 'optional';
                    const arr = attr.array ? ' (array)' : '';
                    const size = attr.size ? ` size=${attr.size}` : '';
                    console.log(`    • ${attr.key} (${attr.type})${arr}${size} - ${req}`);
                }
            } catch(e) {
                console.log(`    Attributes error: ${e.message}`);
            }
            // List indexes
            try {
                const indexes = await databases.listIndexes(DATABASE_ID, col.$id);
                for (const idx of indexes.indexes) {
                    console.log(`    Index: ${idx.key} - type=${idx.type} - attrs=${JSON.stringify(idx.attributes)}`);
                }
            } catch(e) {
                console.log(`    Indexes error: ${e.message}`);
            }
        }
    } catch(e) {
        console.log('Collections error:', e.message);
    }

    // === Functions ===
    console.log('\n=== Functions ===');
    try {
        const functions = new Functions(client);
        const funcs = await functions.list();
        console.log('Total functions:', funcs.total);
        for (const f of funcs.functions) {
            console.log(`  Function: ${f.name} | ID: ${f.$id}`);
            console.log(`    Runtime: ${f.runtime} | Status: ${f.status} | Version: ${f.version}`);
            console.log(`    Created: ${f.$createdAt} | Updated: ${f.$updatedAt}`);
            console.log(`    VCS: ${JSON.stringify(f.vcsConfig || f.vcs)}`);
            console.log(`    Tags: ${JSON.stringify(f.tags)}`);
            console.log(`    Schedule: ${f.schedule || 'none'}`);
            console.log(`    Timeout: ${f.timeout}s`);
            console.log(`    Enabled: ${f.enabled}`);
            // List deployments
            try {
                const deps = await functions.listDeployments(f.$id);
                console.log(`    Deployments: ${deps.total}`);
                for (const d of deps.deployments) {
                    console.log(`      - ${d.$id} | Type: ${d.type} | Status: ${d.status} | Created: ${d.$createdAt} | URL: ${d.url}`);
                }
            } catch(e) {
                console.log(`    Deployments error: ${e.message}`);
            }
        }
    } catch(e) {
        console.log('Functions error:', e.message);
    }

    // === Storage ===
    console.log('\n=== Storage Buckets ===');
    try {
        const storage = new Storage(client);
        const buckets = await storage.listBuckets();
        console.log('Total buckets:', buckets.total);
        for (const b of buckets.buckets) {
            console.log(`  Bucket: ${b.name} | ID: ${b.$id} | Public: ${b.public}`);
        }
    } catch(e) {
        console.log('Storage error:', e.message);
    }

    // === Users ===
    console.log('\n=== Users ===');
    try {
        const users = new Users(client);
        const userList = await users.list();
        console.log('Total users:', userList.total);
        for (const u of userList.users) {
            console.log(`  User: ${u.name || u.email} | ID: ${u.$id} | Email: ${u.email}`);
        }
    } catch(e) {
        console.log('Users error:', e.message);
    }

    process.exit(0);
}

main();
