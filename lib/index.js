const dotenv = require('dotenv');
const Promise = require('bluebird');
const fetch = require('node-fetch');
const FormData = require('form-data');
const concat = require('concat-stream');
const fs = require('fs');
const url = require('url');
const path = require('path');
const util = require('util');
const vorpal = require('vorpal')();

const { chalk } = vorpal;

let AccessToken = null;
let baseURL = null;

dotenv.config();

process.on('uncaughtException', (err) => {
  vorpal.log(`Caught exception: ${err.message}`);
  vorpal.log(err);
});

process.on('unhandledRejection', (reason, p) => {
  vorpal.log('Unhandled Rejection at:', p, 'reason:', reason);
});

const inspect = obj => util.inspect(obj, { colors: true, showHidden: true, depth: 1 });
const readFile = Promise.promisify(fs.readFile);

const handleResponse = (type = 'json') => (res) => {
  if (!res.ok) {
    const error = new Error(`${res.status} - ${res.statusText}`);
    error.res = res;
    throw error;
  }
  return res[type]();
};

const api = {
  authenticate: (UserName, Password) => {
    const body = JSON.stringify({ UserName, Password });
    const headers = { 'Content-Type': 'application/json' };
    return fetch(`${baseURL}/api/authenticate`, { method: 'POST', body, headers })
      .then(handleResponse('text'));
  },
  createPage: (page) => {
    const headers = { Authorization: `AccessToken ${AccessToken}`, ...page.headers };
    return fetch(`${baseURL}/api/pages`, { method: 'POST', body: page.body, headers })
      .then(handleResponse('json'));
  },
};

async function getFormData(DocId, Description, filePath, fileName) {
  const pageData = JSON.stringify({ DocId, Description });
  const file = await readFile(filePath);
  return new Promise((resolve) => {
    const fd = new FormData();
    fd.append('PageCreateData', pageData, { contentType: 'application/json' });
    fd.append('image0', file, fileName);
    fd.pipe(concat({ encoding: 'buffer' }, body => resolve({ body, headers: fd.getHeaders() })));
  });
}

async function authenticate(args, callback) {
  let username = null;
  let password = null;
  ({
    username = process.env.IMAGERIGHT_USERNAME,
    password = process.env.IMAGERIGHT_PASSWORD,
    baseURL = process.env.IMAGERIGHT_BASEURL,
  } = args.options);

  // Disable HTTPS Certificate check (self-signed)
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const result = await this.prompt([{
    type: 'input',
    name: 'baseURL',
    default: baseURL,
    message: 'What is the base URL of your ImageRight API?  ',
  }, {
    type: 'input',
    name: 'username',
    default: username,
    message: 'What is the ImageRight API username?  ',
  }, {
    type: 'password',
    name: 'password',
    default: password,
    message: 'What is the ImageRight API password?  ',
  }]);

  ({ baseURL, username, password } = result);

  const myURL = url.parse(baseURL);
  if (!baseURL) {
    this.log('Please enter a valid Base URL');
    return callback();
  }

  if (!username) {
    this.log('Please enter a valid username');
    return callback();
  }

  if (!password) {
    this.log('Please enter a valid password');
    return callback();
  }

  AccessToken = await api.authenticate(username, password);
  this.log(chalk.red('AccessToken'), chalk.green(AccessToken));
  this.delimiter(`${username}@${myURL.hostname}$`);
  return callback();
}

async function createPage(args, callback) {
  if (!AccessToken) {
    this.log(chalk.red('Missing AccessToken, You must must be authenticated first!'));
    return callback();
  }
  const { filePath, options: { docId, desc = 'a new page' } } = args;
  const formData = await getFormData(docId, desc, path.resolve(filePath), path.basename(filePath));
  const page = await api.createPage(formData);
  this.log(chalk.green(inspect(page)));
  return callback();
}

vorpal
  .command('authenticate', 'Authenticates with the ImageRight API and generates a AccessToken')
  .option('-B, --baseURL <baseURL>', 'ImageRight API Base URL location')
  .option('-U, --username <username>', 'ImageRight User Account Name')
  .option('-P, --password <password>', 'ImageRight Password')
  .action(authenticate);

vorpal
  .command('create page <filePath>', 'creates a new page using a file')
  .option('-D, --docId <docId>', 'ImageRight Document Object ID')
  .option('-n, --desc <description>', 'Page Description')
  .action(createPage);

vorpal
  .delimiter('imageright-cli$')
  .history('imageright-cli')
  .show()
  .parse(process.argv);

module.exports = api;
