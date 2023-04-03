const express = require('express');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const fs = require('fs');

const app = express();
const port = 3000;

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

app.get('/messages/:username/:recipient', (req, res) => {
  const { username, recipient } = req.params;
  const users = readXLSFile('users.xls');
  const user = users.find((u) => u.Username === username);

  if (!user) {
    res.status(404).send('User not found');
    return;
  }

  const messages = readMessages(user.MessagesFile, recipient);
  res.status(200).json(messages);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
