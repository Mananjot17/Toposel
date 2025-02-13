import User from "../models/User.js";

export const searchUser = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res
        .status(400)
        .json({ error: "Please provide a username or email to search" });
    }

    const user = await User.findOne({ username }).select("-password"); // Exclude the password field from the response

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in searchUser controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
