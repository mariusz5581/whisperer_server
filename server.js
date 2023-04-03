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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
