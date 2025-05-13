import chalk from "chalk";
import { Server } from "socket.io";
import { MongoClient } from "mongodb";

const dbm = new MongoClient(process.env.MONGODB_URL as string);
export const config = {
  api: {
    bodyParser: false,
  },
};

export default function IOHandler(req: any, res: any) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    io.on("connection", socket => {
      console.log(chalk.greenBright.bold("+user[socket.io<server>]:"), chalk.italic(socket.id));
      socket.on("msg[Req]", async param => {
        io.to(param.room).emit("msg[Resp]", param);
      });
      socket.on("room[init]", async param => {
        const User = param.User;
        console.log(chalk.greenBright.bold("📢 User:"), chalk.italic(User));
        await dbm.connect();
        const db = dbm.db("ioSocket");
        const collection = db.collection("rooms");
        const room = await collection.findOne({
          _id: param.rQuery,
        });
        if (!room) {
          socket.join(param.rQuery);
          io.to(User).emit("room[inside]", param.rQuery);
          await collection.insertOne({
            _id: param.rQuery,
            exists: true,
          });
          console.log(chalk.green.bold("User"), chalk.green.italic(socket.id), chalk.green.bold("Joined room"), chalk.green.italic(param.rQuery));
        } else {
          io.emit("room[crErr]", `${param.rQuery}: room name already taken!`);
        }
      });
      socket.on("room[join]", async param => {
        const User = param.User;
        console.log(chalk.greenBright.bold("📢 User:"), chalk.italic(User));
        await dbm.connect();
        const db = dbm.db("ioSocket");
        const collection = db.collection("rooms");
        const room = await collection.findOne({
          _id: param.rQuery,
        });
        if (room && room.exists != null && room.exists) {
          socket.join(param.rQuery);
          io.to(User).emit("room[inside]", param.rQuery);
          console.log(chalk.green.bold("User"), chalk.green.italic(socket.id), chalk.green.bold("Joined room"), chalk.green.italic(param.rQuery));
        } else {
          io.emit("room[jrErr]", `${param.rQuery}: room not present. Create one first!`);
        }
      });
      socket.on("disconnect", () => {
        console.log(chalk.cyanBright.bold("-user[socket.io<server>]: "), chalk.italic(socket.id));
      });
    });
    res.socket.server.io = io;
  }
  res.end();
}
