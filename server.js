const express = require('express');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const debug = require('debug')('server');
const app = express();
const port = 3000;

initializeUserFiles();
app.use(bodyParser.json());

function readXLSFile(filename) {
  const workbook = XLSX.readFile(filename);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
}

function readMessages(userFile, recipient) {
  const workbook = XLSX.readFile(userFile);
  
  if (!workbook.SheetNames.includes(recipient)) {
    // Create a new sheet for the recipient
    const newSheet = XLSX.utils.json_to_sheet([]);
    workbook.SheetNames.push(recipient);
    workbook.Sheets[recipient] = newSheet;

    // Save the updated workbook
    XLSX.writeFile(workbook, userFile);
  }

  const sheet = workbook.Sheets[recipient];
  return XLSX.utils.sheet_to_json(sheet);
}

function initializeUserFiles() {
  // Check if users.xls exists, and create it with initial data if not
  if (!fs.existsSync('users.xls')) {
    debug('Creating users.xls file');
    const users = [
      { Username: 'user1', Password: '1234', MessagesFile: 'messages_user1.xls' },
      { Username: 'user2', Password: '5678', MessagesFile: 'messages_user2.xls' },
      { Username: 'user3', Password: '9012', MessagesFile: 'messages_user3.xls' },
    ];
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(users);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Users');
    XLSX.writeFile(workbook, 'users.xls');
  }

  // Create individual user message files if they don't exist
  const users = readXLSFile('users.xls');
  users.forEach((user) => {
    if (!fs.existsSync(user.MessagesFile)) {
      debug(`Creating ${user.MessagesFile}`);
      const workbook = XLSX.utils.book_new();
      const emptySheet = XLSX.utils.json_to_sheet([]);
      XLSX.utils.book_append_sheet(workbook, emptySheet, 'Empty');
      XLSX.writeFile(workbook, user.MessagesFile);
    }
});
}


app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readXLSFile('users.xls');

  const user = users.find(
    (u) => u.Username === username && u.Password === password
  );

  if (user) {
    res.status(200).send('Login successful');
  } else {
    res.status(401).send('Invalid username or password');
  }
});

app.get('/recipients/:username', (req, res) => {
    const username = req.params.username;
    const users = readXLSFile('users.xls');
    const recipients = users.filter(user => user.Username !== username);
    res.json(recipients);
  });
  
  app.post('/addRecipient/:username', (req, res) => {
    const username = req.params.username;
    const newRecipient = req.body.newRecipient;
  
    const users = readXLSFile('users.xls');
    const recipientExists = users.some(user => user.Username === newRecipient);
  
    if (recipientExists) {
      // Update the recipient list or perform any required actions on the server
      res.status(200).send('Recipient added');
    } else {
      res.status(400).send('Recipient not found');
    }
  });


app.listen(port, () => {
  console.log(`Server is running at http://167.86.88.177:${port}`);
});
