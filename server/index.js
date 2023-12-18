import express from "express";
import cors from "cors";
import mysql from "mysql";
import http from "http";
import { Server } from "socket.io";

const app = express();
const PORT = 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "piranti_modul6",
});

db.connect((error) => {
  if (error) {
    console.error("MySQL connection error:", error);
  } else {
    console.log("Connected to MySQL database");
  }
});

io.on("connection", (socket) => {
  console.log("A client connected");

  const onChange = (newData) => {
    io.emit("data-update", newData);
  };

  const changeListener = (newData) => {
    onChange(newData);
  };

  db.on("change", changeListener);

  socket.on("disconnect", () => {
    console.log("A client disconnected");
    db.removeListener("change", changeListener);
  });
});

app.get("/api/movement", (request, response) => {
  db.query("SELECT * FROM movements", (error, results) => {
    if (error) {
      console.error("MySQL query error:", error);
      response.status(500).send("Internal Server Error");
    } else {
      response.json(results);
    }
  });
});

app.post("/api/movement/add", (request, response) => {
  const { x_value, y_value, z_value, angle } = request.query;

  const insertQuery = "INSERT INTO movements (x_value, y_value, z_value, angle) VALUES (?, ?, ?, ?)";
  const values = [x_value, y_value, z_value, angle];

  db.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("MySQL query error:", error);
      response.status(500).send("Internal Server Error");
    } else {
      io.emit("data-update", { x_value, y_value, z_value, angle });
      response.status(201).send("Data added successfully");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
