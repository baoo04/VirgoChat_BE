import bcrypt from "bcryptjs";
import axios from "axios";

import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { convertFullName, oauth2client, generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
  const { email, fullName, password } = req.body;
  try {
    if (!email || !fullName || !password) {
      return res
        .status(400)
        .json({ message: "Tất cả các trường đều bắt buộc" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải lớn hơn 6 ký tự" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userName = await convertFullName(fullName);

    const newUser = new User({
      email,
      fullName,
      userName,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        userName: newUser.userName,
        avatar: newUser.avatar,
      });
    } else {
      res.status(400).json({ message: "Dữ liệu người dùng không hợp lệ" });
    }
  } catch (err) {
    console.log(`Lỗi xử lý đăng ký: ${err.message}`);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const login = async (req, res) => {
  const { phoneNumber, password } = req.body;
  try {
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Mật khẩu không khớp" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      userName: user.userName,
      avatar: user.avatar,
    });
  } catch (err) {
    console.log(`Lỗi xử lý đăng nhập: ${err.message}`);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (err) {
    console.log(`Lỗi xử lý đăng xuất: ${err.message}`);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const loginGoogle = async (req, res) => {
  try {
    const { code } = req.query;
    const googleRes = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleRes.tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );

    const { email, name, picture } = userRes.data;

    let user = await User.findOne({ email }).select("-password");

    if (!user) {
      const userName = await convertFullName(name);

      user = await User.create({
        email,
        fullName: name,
        userName,
        avatar: picture,
      });

      user = user.toObject();
      delete user.password;
    }

    const token = generateToken(user._id, res);

    res.status(200).json({
      token,
      user,
    });
  } catch (err) {
    console.log(`Lỗi ở kiểm tra người dùng: ${err.message}`);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (err) {
    console.log(`Lỗi ở kiểm tra người dùng: ${err.message}`);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { avatar } = req.body;
    const userId = req.user._id;

    if (!avatar) {
      return res.status(400).json({ message: "Avatar là bắt buộc" });
    }

    const uploadResponse = await cloudinary.uploader.upload(avatar);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (err) {
    console.log(`Lỗi cập nhật hồ sơ: ${err.message}`);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};
