import Room from "../models/room.model.js";
import Message from "../models/message.model.js";
import Relationship from "../models/relationship.model.js";

export const getRooms = async (req, res) => {
  const userId = req.user._id;
  try {
    const rooms = await Room.find({
      "members.user": userId,
    })
      .select("name _id roomType members")
      .populate({
        path: "members.user",
        select: "_id fullName avatar",
      });

    const roomWithLastMessages = await Promise.all(
      rooms.map(async (room) => {
        const lastMessage = await Message.findOne({ room: room._id })
          .populate({
            path: "sender",
            select: "_id fullName",
          })
          .sort({ createdAt: -1 })
          .lean();
        return {
          ...room.toObject(),
          lastMessage: lastMessage
            ? {
                text: lastMessage.text,
                messageType: lastMessage.messageType,
                file: lastMessage.file,
                sender: {
                  _id: lastMessage.sender._id,
                  fullName: lastMessage.sender.fullName,
                },
                createdAt: lastMessage.createdAt,
              }
            : undefined,
        };
      })
    );

    res.status(200).json({ rooms: roomWithLastMessages });
  } catch (err) {
    console.log(`Lỗi lấy thông tin người dùng cho SideBar: ${err.message}`);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const getRoom = async (req, res) => {
  const { roomId } = req.params;
  const currentUserId = req.user._id;

  try {
    if (!roomId) {
      return res.status(400).json({ message: "Yêu cầu roomId" });
    }

    const room = await Room.findById(roomId).populate({
      path: "members.user",
      select: "_id fullName avatar",
    });

    if (!room) {
      return res.status(404).json({ message: "Phòng không tồn tại" });
    }

    let blockedMembers = [];

    const memberIds = room.members.map((member) => member.user._id);

    const blockedRelationships = await Relationship.find({
      from: currentUserId,
      to: { $in: memberIds },
      relationshipType: "block",
    }).populate({
      path: "to",
      select: "_id fullName userName avatar",
    });

    blockedMembers = blockedRelationships.map(
      (relationship) => relationship.to
    );

    const messages = await Message.find({ room: roomId })
      .populate({
        path: "sender",
        select: "_id fullName avatar",
      })
      .populate({
        path: "reactions.user",
        select: "_id fullName avatar",
      });

    return res
      .status(200)
      .json({ room: { ...room.toObject(), blockedMembers }, messages });
  } catch (err) {
    console.log(`Lỗi lấy thông tin phòng: ${err.message}`);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const updateNickName = async (req, res) => {
  const { roomId } = req.params;
  const { nickName, userId } = req.body;
  const currentUserId = req.user._id;

  try {
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng" });
    }

    const memberChangeNickName = room.members.find(
      (member) => member.user.toString() === userId
    );

    const checkPermission = room.members.find(
      (member) => member.user.toString() === currentUserId
    );

    if (!checkPermission || !memberChangeNickName) {
      return res
        .status(403)
        .json({ message: "Không có quyền cập nhật nickname" });
    }

    memberChangeNickName.nickName = nickName;

    await room.save();

    res.status(200).json({ message: "Cập nhật nickname thành công" });
  } catch (err) {
    console.log(`Lỗi cập nhật nickname: ${err.message}`);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const deleteNickName = async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;
  const currentUserId = req.user._id;

  try {
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng" });
    }

    const memberChangeNickName = room.members.find(
      (member) => member.user.toString() === userId
    );

    const checkPermission = room.members.find(
      (member) => member.user.toString() === currentUserId
    );

    if (!checkPermission || !memberChangeNickName) {
      return res.status(403).json({ message: "Không có quyền xóa nickname" });
    }

    memberChangeNickName.nickName = undefined;

    await room.save();

    res.status(200).json({ message: "Xóa nickname thành công" });
  } catch (err) {
    console.log(`Lỗi xóa nickname: ${err.message}`);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const deleteRoom = async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng" });
    }

    await Message.deleteMany({ room: roomId });

    await Relationship.deleteOne({ room: roomId });

    await room.deleteOne();

    res.status(200).json({ message: "Xóa phòng thành công" });
  } catch (err) {
    console.log(`Lỗi xóa phòng: ${err.message}`);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};
