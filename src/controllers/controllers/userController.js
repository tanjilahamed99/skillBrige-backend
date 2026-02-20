// const User = require("../models/User");
// const WebsiteInfo = require("../models/WebsiteInfo");

// exports.getAllUsers = async (req, res) => {
//   try {
//     let { search, limit } = req.body;
//     search = search || "";
//     limit = limit || 25;

//     const users = await User.aggregate([
//       {
//         $project: {
//           fullName: { $concat: ["$firstName", " ", "$lastName"] },
//           firstName: 1,
//           lastName: 1,
//           username: 1,
//           email: 1,
//           picture: 1,
//           tagLine: 1,
//           consultantStatus: 1,
//           qualification: 1,
//         },
//       },
//       {
//         $match: {
//           $and: [
//             {
//               $or: [
//                 { fullName: { $regex: search, $options: "i" } },
//                 { email: { $regex: search, $options: "i" } },
//                 { username: { $regex: search, $options: "i" } },
//                 { firstName: { $regex: search, $options: "i" } },
//                 { lastName: { $regex: search, $options: "i" } },
//               ],
//             },
//             { email: { $ne: req.user.email } },
//           ],
//         },
//       },
//       { $sort: { _id: -1 } },
//       { $limit: limit },
//       {
//         $lookup: {
//           from: "images",
//           localField: "picture",
//           foreignField: "_id",
//           as: "picture",
//         },
//       },
//       { $unwind: { path: "$picture", preserveNullAndEmptyArrays: true } },
//     ]);

//     res.status(200).json(users);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.toggleFavorite = (req, res) => {
//   let { roomId } = req.body;
//   User.findOne({ _id: req.user._id })
//     .then((user) => {
//       let update;
//       if (user.favorites.includes(roomId))
//         update = { $pull: { favorites: roomId } };
//       else update = { $push: { favorites: roomId } };
//       User.findOneAndUpdate({ _id: req.user._id }, update, { new: true })
//         .populate({
//           path: "favorites",
//           populate: [
//             {
//               path: "people",
//               select: "-email -tagLine -password -friends -__v",
//               populate: {
//                 path: "picture",
//               },
//             },
//             {
//               path: "lastMessage",
//             },
//             {
//               path: "picture",
//             },
//           ],
//         })
//         .then((user) => {
//           res.status(200).json({ favorites: user.favorites, roomId });
//         })
//         .catch((err) => {
//           console.log(err);
//           res.status(500).json({ error: true });
//         });
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({ error: true });
//     });
// };

// exports.getFavorites = async (req, res) => {
//   try {
//     const user = await User.findOne({ _id: req.user._id }).populate({
//       path: "favorites",
//       populate: [
//         {
//           path: "people",
//           select: "-email -password -friends -__v",
//           populate: { path: "picture" },
//         },
//         { path: "lastMessage" },
//         { path: "picture" },
//       ],
//     });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.status(200).json({ favorites: user.favorites });
//   } catch (err) {
//     console.error("Error fetching favorites:", err);
//     res.status(500).json({ error: true, message: err.message });
//   }
// };

// exports.ChangePicture = async (req, res) => {
//   try {
//     const { imageId } = req.body;
//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       { $set: { picture: imageId } },
//       { new: true }
//     ).populate({ path: "picture", strictPopulate: false });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     return res.status(200).json(user.picture);
//   } catch (error) {
//     console.error("Error changing picture:", error);
//     return res.status(500).json({
//       error: "Internal server error",
//       message: error.message,
//     });
//   }
// };

// exports.getWebData = async (req, res) => {
//   try {
//     const settings = await WebsiteInfo.findOne(); // Only one document expected
//     if (!settings) {
//       return res
//         .status(404)
//         .json({ message: "Website settings not found", success: false });
//     }

//     res.json({ success: true, data: settings });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Error fetching website settings", success: false });
//   }
// };

// exports.qualification = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!id) {
//       return res.status(400).send({
//         message: "Invalid ID provided.",
//         success: false,
//       });
//     }
//     const isExistingUser = await User.findById(id);

//     if (!isExistingUser) {
//       return res.status(404).send({
//         message: "User not found.",
//         success: false,
//       });
//     }

//     if (isExistingUser.type !== "Consultant") {
//       return res.status(401).send({
//         success: false,
//         message: "Invalid data",
//       });
//     }

//     const { qualification, perMinute } = req.body;

//     const updateUserData = await User.findOneAndUpdate(
//       { _id: id },
//       {
//         $set: {
//           price: perMinute,
//           qualification,
//         },
//       },
//       { new: true }
//     );
//     if (!updateUserData) {
//       return res.status(500).send({
//         message: "Failed to update user data.",
//         success: false,
//       });
//     }
//     res.send({
//       message: "Qualification Updated.",
//       success: true,
//     });
//   } catch (error) {
//     console.log(error);
//     res.send({
//       message: "An error occurred while processing your request.",
//       success: false,
//     });
//   }
// };

// exports.updateCallBalance = async (req, res) => {
//   try {
//     const {
//       myId,
//       myHistory,
//       myBalance,
//       clientId,
//       clientHistory,
//       clientBalance,
//     } = req.body;
//     // Validate required fields
//     if (!myId || !clientId || !myBalance || !clientBalance) {
//       return res.send({
//         message:
//           "Missing required fields: myId, clientId, myBalance, clientBalance",
//         success: false,
//       });
//     }

//     // Validate numeric balances
//     const parsedMyBalance = parseFloat(myBalance);
//     const parsedClientBalance = parseFloat(clientBalance);

//     if (isNaN(parsedMyBalance) || isNaN(parsedClientBalance)) {
//       return res.status(400).json({
//         message: "Invalid balance values provided",
//         success: false,
//       });
//     }

//     // Prepare transaction history entry
//     const transactionId = `txn_${Date.now()}_${Math.random()
//       .toString(36)
//       .substr(2, 9)}`;

//     const myData = await User.findById(myId);

//     // Create transaction record
//     const transactionRecord = {
//       transactionId,
//       status: "completed",
//       ...myHistory,
//       author: {
//         name: `${myData.firstName}${" "}${myData.lastName}`,
//         email: myData.email,
//         id: myId,
//       },
//     };

//     // Update both users in a single database transaction if using MongoDB transactions
//     // For simplicity, updating sequentially. Consider using transactions for atomic updates.

//     // Update my account
//     const myUpdate = await User.findOneAndUpdate(
//       { _id: myId },
//       {
//         $set: { balance: { amount: parsedMyBalance } },
//         $push: {
//           history: {
//             $each: [
//               {
//                 ...transactionRecord,
//               },
//             ],
//             $position: 0,
//           },
//         },
//       },
//       { new: true, runValidators: true }
//     );

//     if (!myUpdate) {
//       return res.status(404).json({
//         message: "User account not found",
//         success: false,
//       });
//     }

//     //   client update
//     const clientData = await User.findById(clientId);
//     const clientHistoryRecord = {
//       transactionId,
//       status: "completed",
//       ...clientHistory,
//       author: {
//         name: `${clientData.firstName}${" "}${clientData.lastName}`,
//         email: clientData.email,
//         id: clientId,
//       },
//     };

//     // Update client account
//     const clientUpdate = await User.findOneAndUpdate(
//       { _id: clientId },
//       {
//         $set: { balance: { amount: parsedClientBalance } },
//         $push: {
//           history: {
//             $each: [
//               {
//                 ...clientHistoryRecord,
//               },
//             ],
//             $position: 0,
//           },
//         },
//       },
//       { new: true, runValidators: true }
//     );

//     if (!clientUpdate) {
//       // Consider rolling back the first update here if atomicity is critical
//       return res.status(404).json({
//         message: "Client account not found",
//         success: false,
//       });
//     }

//     // Return success response
//     return res.status(200).json({
//       message: "Balances updated successfully",
//       success: true,
//       data: {
//         transactionId,
//         myBalance: parsedMyBalance,
//         clientBalance: parsedClientBalance,
//       },
//     });
//   } catch (error) {
//     console.error("Update call balance error:", error);
//     // Differentiate between server errors and validation errors
//     const errorMessage =
//       error.name === "ValidationError"
//         ? "Validation error: " + error.message
//         : "An internal server error occurred while processing your request";
//     return res.json({
//       message: errorMessage,
//       success: false,
//       ...(process.env.NODE_ENV === "development" && { error: error.message }),
//     });
//   }
// };

// exports.withdrawalRequest = async (req, res) => {
//   try {
//     const { withdrawalAmount, ...rest } = req.body;
//     const { id } = req.params;

//     const myData = await User.findById(id);
//     if (!myData) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (myData.balance.amount < withdrawalAmount) {
//       return res.status(400).json({
//         success: false,
//         message: "Insufficient balance for withdrawal",
//       });
//     }

//     // Prepare transaction history entry
//     const transactionId = `txn_${Date.now()}_${Math.random()
//       .toString(36)
//       .substr(2, 9)}`;

//     // Create transaction record
//     const transactionRecord = {
//       transactionId,
//       historyType: "withdrawal",
//       amount: withdrawalAmount,
//       status: "pending",
//       ...rest,
//       author: {
//         name: `${myData.firstName}${" "}${myData.lastName}`,
//         email: myData.email,
//         id,
//       },
//     };

//     // Update my account
//     const myUpdate = await User.findOneAndUpdate(
//       { _id: id },
//       {
//         $set: { balance: { amount: myData.balance.amount - withdrawalAmount } },
//         $push: {
//           history: {
//             $each: [
//               {
//                 ...transactionRecord,
//               },
//             ],
//             $position: 0,
//           },
//         },
//       },
//       { new: true, runValidators: true }
//     );

//     res.send({
//       message: "Withdrawal request submitted successfully",
//       success: true,
//       myUpdate,
//     });
//   } catch (error) {
//     console.error("withdrawal error:", error);
//     // Differentiate between server errors and validation errors
//     const errorMessage =
//       error.name === "ValidationError"
//         ? "Validation error: " + error.message
//         : "An internal server error occurred while processing your request";
//     return res.json({
//       message: errorMessage,
//       success: false,
//       ...(process.env.NODE_ENV === "development" && { error: error.message }),
//     });
//   }
// };
