import http from "http";
import { Server } from "socket.io";
import { Message } from "../models";
import { SocketMessage, GlobalUser } from "../types/types";
import { User } from "../models";

let io: Server;

const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        const allowedOriginPatterns = [
          // Add your own patterns here
          /https:\/\/yourdomain\.com$/, // Example: Replace with your own domain
          /http:\/\/localhost:3000$/, 
        ];

        // Check if the origin matches any of the patterns
        if (
          !origin ||
          allowedOriginPatterns.some((pattern) => pattern.test(origin))
        ) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // get the user or hospital details
    const user: GlobalUser | any = socket?.handshake.query!;
    console.log(`${user?.username} connected`);

    /* Appointment events */
    socket.on("newAppointment", (data: any) => {
      io.emit("newAppointment", data);
    });

    socket.on("updateAppointment", (data: any) => {
      io.emit("updateAppointment", data);
    });

    socket.on("cancelAppointment", (data: any) => {
      io.emit("canceAppointment", data);
    });

    socket.on("deleteAppointment", (data: any) => {
      io.emit("deleteAppointment", data);
    });

    socket.on("approveAppointment", (data: any) => {
      io.emit("approveAppointment", data);
    });

    /* Review Events */
    socket.on("newReview", (data: any) => {
      io.emit("newReview", data);
    });

    socket.on("updateReview", (data: any) => {
      io.emit("updateReview", data);
    });
    socket.on("deleteReview", (data: any) => {
      io.emit("deleteReview", data);
    });

    /* User Login Events*/

    socket.on("userLogin", (data: any) => {
      io.emit("userLogin", data);
    });

    socket.on("userLogout", (data: any) => {
      io.emit("userLogout", data);
    });

    /* User or Hospital online activity */
    socket.on("onlineUsers", (data: any) => {
      io.emit("onlineUsers", data);
    });

    socket.on("onlineHospitals", (data: any) => {
      io.emit("onlineHospitals", data);
    });

    /* User or Hospital Chats */

    socket.on("joinRoom", async (data: any) => {
      try {
        const messages = await Message.find({ roomId: data }).sort({
          createdAt: 1,
        });

        if (messages.length === 0) {
          io.emit("chatHistory", []);
        } else {
          io.emit("chatHistory", messages);
        }

        //join the room

        console.log(`${data} has been created`);
        socket.join(data);
      } catch (error) {
        console.error(error);
      }
    });

    //event to emit hospitals messaged recently
    socket.on("getRecentHospitals", async (data: any) => {
      /* We want to emit the hosptitals that usERS messaged reccently */

      const { userId } = data;

      socket.join(userId);

      const recentlyMessagedHospitals = await Message.aggregate([
        { $match: { receiver: userId } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$roomId", message: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$message" } },
      ]);

      const receiverIds = recentlyMessagedHospitals.map(
        (message) => message.receiver
      );
      const recentHospitals = await Hospital.find({
        _id: { $in: receiverIds },
      });

      io.to(userId).emit("recentHospitals", recentHospitals);
    });
    //event to emit users messaged recently

    socket.on("getRecentUsers", async (data: any) => {
      /* We want to emit the hosptitals that usERS messaged reccently */

      const { hospitalId } = data;

      socket.join(hospitalId);

      const recentlyMessagedUsers = await Message.aggregate([
        { $match: { receiver: hospitalId } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$roomId", message: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$message" } },
      ]);

      const receiverIds = recentlyMessagedUsers.map(
        (message) => message.receiver
      );
      const recentUsers = await User.find({
        _id: { $in: receiverIds },
      });

      io.to(hospitalId).emit("recentUsers", recentUsers);
    });

    //event to emit reviews

    socket.on("sendMessage", async (data: SocketMessage) => {
      /*
       I'm expecting the following properties
       message: string, sender: Id, receiver: Id, roomId: string
      */
      const { roomId } = data;

      //console.log(data);
      const savedMessage = await Message.create(data);

      io.to(roomId!).emit("newMessage", data);
    });

    socket.on("typing", (data: SocketMessage) => {
      const roomId = data.roomId!;

      socket.broadcast.to(roomId).emit("responseTyping", {
        sender: data.sender,
        receiver: data.receiver,
        message: `${user?.username} is typing...`,
      });
    });

    socket.on("disconnect", () => {
      console.log(`${user?.username} disconnected`);
    });
  });
};

export { initSocket, io };
