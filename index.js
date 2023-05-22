#! /usr/bin/env node

const axios = require('axios');
const fs = require('fs');

const name = 'DockWipe';
const optionFiles = ['.dockwipe', 'dockwipe.json'];

function arg(keys, defaultValue) {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const args = process.argv.slice(2);

    for (const arg of args) {
        const [keyPart, valuePart] = arg.split('=');
        const keyName = keyPart.replace(/^--?/, ''); // remove the leading '-' or '--'

        if (keyArray.includes(keyName)) {
            if (valuePart !== undefined) {
                return valuePart;
            }

            const nextArgIndex = args.indexOf(arg) + 1;
            const nextArg = args[nextArgIndex];

            if (nextArg !== undefined && !nextArg.startsWith('-')) {
                return nextArg;
            }
        }
    }

    return defaultValue;
}

(async function () {
    const inquirer = (await import('inquirer')).default;
    const figlet = (await import('figlet')).default;
    const chalk = (await import('chalk')).default;

    console.clear();

    console.log(chalk.yellow(figlet.textSync(name, { horizontalLayout: 'full' })));
    console.log(chalk.blue('---- Welcome to ' + chalk.green.bold(name) + '! ----'));
    let file = arg(['file', 'f']) || optionFiles.find(f => fs.existsSync(f))

    if (file){
        console.log(`Using options from file ${file}`,);
    }

    const fromFileOptions = file && fs.existsSync(file)
        ? JSON.parse(fs.readFileSync(file, 'utf8'))
        : {};

    const options = {
        registry: arg(['registry', 'r'], fromFileOptions.registry),
        image: arg(['image', 'i'], fromFileOptions.image),
        username: arg(['username', 'u', 'user'], fromFileOptions.username),
        password: arg(['password', 'p', 'pass'], fromFileOptions.password),
        tags: arg(['tags', 't'], fromFileOptions.tags || '' ).split(',').filter(t => !!t)
    };


    const promptData = await inquirer.prompt([
        {
            name: 'registry',
            message: 'Docker registry:',
            default: fromFileOptions?.defaults?.registry || 'https://hub.docker.com',
            when: !options.registry
        },
        {
            name: 'image',
            message: 'Docker image:',
            default: fromFileOptions?.defaults?.image,
            when: !options.image
        },
        {
            name: 'username',
            message: 'Username:',
            default: fromFileOptions?.defaults?.username,
            when: !options.username
        },
        {
            type: 'password',
            name: 'password',
            message: 'Password:',
            default: fromFileOptions?.defaults?.password,
            when: !options.password
        },
    ]);

    const filteredOptions = Object.fromEntries(Object.entries(options).filter(([_, v]) => v !== undefined));
    const userData = Object.assign(promptData, filteredOptions);

    console.log('Using the following data:');
    console.table({ ...userData, password: userData.password ? '********' : undefined });

    const apiUrl = `https://${userData.registry}/v2/${userData.image}`;
    const basicAuth = Buffer.from(`${userData.username}:${userData.password}`).toString('base64');
    const headers = {
        Authorization: `Basic ${basicAuth}`,
        Accept: 'application/vnd.docker.distribution.manifest.v2+json'
    }
    const result = await axios.get(`${apiUrl}/tags/list`, {headers});
    const tags = result.data.tags;


    const tagsToDelete = userData.tags && userData.tags.length ? userData.tags : (await inquirer.prompt([{
        type: 'checkbox',
        name: 'tags',
        message: `Found ${tags.length} tags for image "${userData.image}". Please select which ones you want to delete.`,
        choices: tags
    }])).tags;


    for (const tag of tagsToDelete) {
        process.stdout.write(`Deleting tag "${tag}"... `);

        const headResult = await axios.head(`${apiUrl}/manifests/${tag}`, {headers});
        const digest = headResult.headers['docker-content-digest'];
        const deleteResult = await axios.delete(`${apiUrl}/manifests/${digest}`, {headers});

        process.stdout.write(`${deleteResult.statusText}\n`);
    }

    console.log('Done.')
})();
