const CryptoJS = require("crypto-js"); // npm install crypto-js
const express = require("express");
const app = express();
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const http = require("http").Server(app);
app.use(cors());
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "UPDATE"],
  },
});
//const io = require("socket.io")(http);
require("dotenv").config();
var Messenger = require("./models/messenger");
const messengerAPI = require("./router/chatRouter");
const authRouter = require("./router/authRouter");
const profileRouter = require("./router/profileRouter");
const productRouter = require("./router/productRouter");
const adminRouter = require("./router/adminRouter");
const sellerRouter = require("./router/sellerRouter");
const categoriesRouter = require("./router/categoriesRouter");
const zalopayRouter = require("./router/zaloPayRouter");
const momoRouter = require("./router/momoRouter");
mongoose.connect(
  process.env.MONGODB_URI,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => console.log("connect to db")
);

const port = 3001;

//chat
app.use("/messenger", messengerAPI);
//product
app.use("/product", productRouter);
//categories
app.use("/categories", categoriesRouter);
//user

app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/seller", sellerRouter);
app.use("/admin", adminRouter);
app.use("/zalopay", zalopayRouter);
app.use("/momo", momoRouter);

io.on("connection", (socket) => {
  console.log(`Có người vừa kết nối, socketID: ${socket.id}`);
  socket.on("disconnect", (data) => {
    console.log(`Có người vừa out: ${socket.id}`);
  });
  socket.emit("hello", {
    message: "hello",
  });
  socket.on("send_message", (data) => {
    console.log(data.name + ": " + data.message);

    const newData = {
      id_user1: data.id_user2,
      id_user2: data.id_user1,
      id: Math.random().toString(),
      message: data.message,
      name: data.name,
      category: "receive",
    };

    //console.log(newData.message);
    const postData = async () => {
      let isNew = false;
      const messenger = await Messenger.findOne({
        id_user1: newData.id_user1,
        id_user2: newData.id_user2,
      });
      if (messenger === null) {
        isNew = true;
        const newMes = new Messenger({
          id_user1: newData.id_user1,
          id_user2: newData.id_user2,
          content: newData,
        });
        await newMes.save();
      } else {
        messenger.content.push(newData);

        await messenger.save();
      }
      return messenger.content.length;
    };

    postData().then((res) => {
      console.log(res)
      socket.broadcast.emit("receive_message");
    });
  });

  socket.on("keyboard_message_send", (data) => {
    console.log(data.id_user1 + ": " + data.message);

    socket.broadcast.emit("keyboard_message_receive", data);
  });
});
http.listen(port, () => {
  console.log(`Listening to port: ${port}`);
});
