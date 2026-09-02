const { Client, Account } = require('appwrite');

const client = new Client().setEndpoint('https://cloud.appwrite.io/v1');

async function main() {
    const session = await new Account(client).createEmailPasswordSession({
        email: 'redx87518@gmail.com',
        password: 'Abdulgafar2@',
        duration: 86400
    });
    console.log('Session ID:', session.$id);
    
    // Extract the console session cookie from providerUid (the encoded session)
    // The a_session_console cookie value is the providerUid
    const consoleCookie = session.providerUid;
    console.log('Console cookie (providerUid):', consoleCookie ? 'present (' + consoleCookie.substring(0, 50) + '...)' : 'missing');
    
    // Try to find the project ID by trying different API paths
    const paths = [
        '/v1/account/access/projects',
        '/v1/account/teams',
        '/v1/teams',
        '/v1/account/organizations',
        '/v1/organizations',
        '/v1/account/access/teams',
        '/v1/graphql',
        '/v1/console/graphql',
        '/v2/console/organizations',
        '/v1/console/organizations',
        '/v1/console/teams',
        '/v1/account/sessions',
        '/v1/account/sessions/' + session.$id,
    ];

    for (const path of paths) {
        try {
            const res = await fetch('https://cloud.appwrite.io/v1' + path, {
                method: path === '/v1/graphql' ? 'POST' : 'GET',
                headers: {
                    'Cookie': 'a_session_console=' + consoleCookie,
                    'Content-Type': 'application/json',
                    'X-Appwrite-Response-Format': '1.7.5',
                },
                body: path === '/v1/graphql' ? JSON.stringify({
                    query: '{ projects { id name organization { id name } } }'
                }) : undefined
            });
            const text = await res.text();
            const status = res.status;
            const preview = text.length > 300 ? text.substring(0, 300) + '...' : text;
            if (status !== 404) {
                console.log(`[${status}] ${path}: ${preview}`);
            } else {
                console.log(`[404] ${path}: NOT FOUND`);
            }
        } catch(e) {
            console.log(`[ERR] ${path}: ${e.message}`);
        }
    }
}

main().catch(console.error);
