const { Client, Account, Teams } = require('appwrite');

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1');

const account = new Account(client);

async function main() {
    try {
        // Step 1: Create an email/password session
        const session = await account.createEmailPasswordSession({
            email: 'redx87518@gmail.com',
            password: 'Abdulgafar2@',
            duration: 86400
        });
        console.log('Session created:', session.$id);

        // Set the session on the client
        client.setSession(session.$id);

        // Step 2: Get account details
        const me = await account.get();
        console.log('Authenticated as:', me.email);
        console.log('User ID:', me.$id);

        // Step 3: Try to list teams
        try {
            const teams = await account.listTeams();
            console.log('Teams count:', teams.total);
            teams.teams.forEach(t => {
                console.log('  Team:', t.name, '| ID:', t.$id);
            });
        } catch (e) {
            console.log('listTeams error:', e.message);
        }

        // Step 4: Try direct API call to list accessible projects
        const endpoints = [
            'https://cloud.appwrite.io/v1/account/access/projects',
            'https://cloud.appwrite.io/v1/account/access/organizations',
        ];

        for (const url of endpoints) {
            try {
                const res = await fetch(url, {
                    headers: {
                        'Cookie': `a_session_console=${session.providerUid}`,
                        'X-Appwrite-Response-Format': '1.7.5',
                    }
                });
                const text = await res.text();
                console.log(url, '->', res.status, text.substring(0, 300));
            } catch (e) {
                console.log(url, '-> ERROR:', e.message);
            }
        }

        // Step 5: Try listing projects via SDK management API
        try {
            const teamsList = await account.listTeams();
            for (const team of teamsList.teams) {
                const teamsApi = new Teams(client);
                const projects = await teamsApi.listProjects(team.$id);
                console.log('Projects in team', team.name + ':', projects.total);
                projects.projects.forEach(p => {
                    console.log('  Project:', p.name, '| ID:', p.$id);
                });
            }
        } catch (e) {
            console.log('listProjects error:', e.message);
        }

    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) console.error('Response:', JSON.stringify(e.response, null, 2));
    }
}

main();
