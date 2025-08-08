const express = require('express');
const cors = require("cors");
const app = express();
const port = 5000;
const authenticateToken = require('./middleware/authMiddleware');
const SECRET = 'ABCD@1234';
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const authorizeRole = require('./middleware/authorizeRole');
const DATA_FILE = path.join(__dirname,"users.json");

function readUsers(){
  if(!fs.existsSync(DATA_FILE)){
    fs.writeFileSync(DATA_FILE,JSON.stringify([]));
  }
  const data = fs.readFileSync(DATA_FILE,"utf-8");
  return JSON.parse(data);
}
function writeUsers(users){
  fs.writeFileSync(DATA_FILE,JSON.stringify(users,null,2));
}
function saveUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}



app.use(express.urlencoded({extended:true}));
app.use(express.json())
 
var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
  credentials: true, 
}
app.use(cors(corsOptions));


app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    let users = readUsers();

    // Find user
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
      return res.status(401).json({ message: "Invalid credentials", status: false });
    }

    let user = users[userIndex];

    // Check password
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials", status: false });
    }

    // Update last login time
    user.lastLogin = new Date().toISOString();
    users[userIndex] = user;
    saveUsers(users);

    // Generate JWT with role
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "1d" });

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      lastLogin: user.lastLogin,
      status: true
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




app.post("/signup", (req, res) => {
  try {
    const { name, email, password ,role} = req.body;

    const users = readUsers();

    // Check if email already exists
    if (users.some(user => user.email === email)) {
      return res.status(400).json({ message: "Email already registered", status: false });
    }

    // Create new user object
    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role: role || "user",
    };

    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ message: "User created", status: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get("/dashboard", authenticateToken,(req, res) => {
  const users = readUsers();
  const user = users.find(u=>u.id===req.user.id);
  if(!user){
    return res.status(404).json({message:"User not exists"});
  } 
  
  res.json({ message: "Welcome to dashboard", user });
});


app.get("/adminDashboard",authenticateToken,authorizeRole("admin"),(req,res)=>{
  const users = readUsers();
  
  res.json({
    admin: req.user, 
    users
  });
})


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

