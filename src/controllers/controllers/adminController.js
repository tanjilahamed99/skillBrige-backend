// const Contact = require("../models/Contact");
// const LiveKit = require("../models/LiveKit");
// const Paygic = require("../models/Paygic");
// const Razorpay = require("../models/Razorpay");
// const User = require("../models/User");
// const WebsiteInfo = require("../models/WebsiteInfo");

// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find({}).select("-password");
//     res.status(200).json(users);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.deleteUser = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const user = await User.findByIdAndDelete(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.json({ message: "User deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.updateUser = async (req, res) => {
//   try {
//     const { userId, ...updateData } = req.body;

//     // Find the user first
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Check if password is being updated
//     if (updateData.password) {
//       // Set the password (it will be hashed in pre-save middleware)
//       user.password = updateData.password;
//       delete updateData.password; // Remove from updateData to avoid duplication
//     }

//     // Update other fields
//     Object.assign(user, updateData);

//     // Save the user
//     await user.save();

//     // Convert to plain object and remove password
//     const userObject = user.toObject();
//     delete userObject.password;

//     res.json({
//       message: "User updated successfully",
//       status: 200,
//       success: true,
//       user: userObject,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.setPaygic = async (req, res) => {
//   try {
//     const updatedData = req.body;
//     let settings = await Paygic.findOne();
//     if (!settings) {
//       // If no document exists yet, create it
//       settings = new Paygic(updatedData);
//     } else {
//       // Update existing document
//       Object.assign(settings, updatedData);
//     }

//     await settings.save();
//     res.json({
//       success: true,
//       message: "Website settings updated",
//       data: settings,
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Error updating website settings", success: false });
//   }
// };

// exports.setLiveKit = async (req, res) => {
//   try {
//     const updatedData = req.body;
//     let settings = await LiveKit.findOne();
//     if (!settings) {
//       // If no document exists yet, create it
//       settings = new LiveKit(updatedData);
//     } else {
//       // Update existing document
//       Object.assign(settings, updatedData);
//     }

//     await settings.save();
//     res.json({
//       success: true,
//       message: "Website settings updated",
//       data: settings,
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Error updating website settings", success: false });
//   }
// };

// exports.getLiveKitData = async (req, res) => {
//   try {
//     const settings = await LiveKit.findOne(); // Only one document expected
//     if (!settings) {
//       return res
//         .status(404)
//         .json({ message: "Website settings not found", success: false });
//     }

//     return res.json({ success: true, data: settings });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Error fetching website settings", success: false });
//   }
// };

// exports.setRazorpay = async (req, res) => {
//   try {
//     const updatedData = req.body;
//     let settings = await Razorpay.findOne();
//     if (!settings) {
//       // If no document exists yet, create it
//       settings = new Razorpay(updatedData);
//     } else {
//       // Update existing document
//       Object.assign(settings, updatedData);
//     }

//     await settings.save();
//     res.json({
//       success: true,
//       message: "Website settings updated",
//       data: settings,
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Error updating website settings", success: false });
//   }
// };

// exports.setWebData = async (req, res) => {
//   try {
//     const updatedData = req.body;
//     let settings = await WebsiteInfo.findOne();
//     if (!settings) {
//       // If no document exists yet, create it
//       settings = new WebsiteInfo(updatedData);
//     } else {
//       // Update existing document
//       Object.assign(settings, updatedData);
//     }

//     await settings.save();
//     res.json({
//       success: true,
//       message: "Website settings updated",
//       data: settings,
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Error updating website settings", success: false });
//   }
// };

// exports.getPayGicData = async (req, res) => {
//   try {
//     const settings = await Paygic.findOne(); // Only one document expected
//     if (!settings) {
//       return res
//         .status(404)
//         .json({ message: "Website settings not found", success: false });
//     }

//     return res.json({ success: true, data: settings });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Error fetching website settings", success: false });
//   }
// };

// exports.getRazorpayData = async (req, res) => {
//   try {
//     const settings = await Razorpay.findOne(); // Only one document expected
//     if (!settings) {
//       return res
//         .status(404)
//         .json({ message: "Website settings not found", success: false });
//     }

//     return res.json({ success: true, data: settings });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Error fetching website settings", success: false });
//   }
// };

// exports.creditUser = async (req, res) => {
//   try {
//     const { userId, userEmail, credit } = req.body;

//     if (!userId || !userEmail || !credit) {
//       return res.send({
//         message: "All fields are required.",
//         success: false,
//       });
//     }
//     const findUser = await User.findOne({
//       _id: userId,
//       email: userEmail,
//     });

//     if (!findUser) {
//       return res.send({
//         message: "User not found.",
//         success: false,
//       });
//     }

//     // new code     // Prepare transaction history entry
//     const transactionId = `txn_${Date.now()}_${Math.random()
//       .toString(36)
//       .substr(2, 9)}`;

//     // Create transaction record
//     const transactionRecord = {
//       transactionId,
//       author: {
//         name: `${findUser.firstName}${" "}${findUser.lastName}`,
//         email: findUser.email,
//         id: userId,
//       },
//       historyType: "Admin Credit",
//       amount: credit,
//       paymentMethod: "Credit",
//       status: "completed",
//     };

//     // Update my account
//     const updateUserData = await User.findOneAndUpdate(
//       { _id: userId },
//       {
//         $set: {
//           balance: { amount: findUser.balance.amount + parseInt(credit) },
//         },
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
//       message: "User balance updated successfully.",
//       success: true,
//       data: updateUserData,
//     });
//   } catch (error) {
//     console.log(error);
//     res.send({
//       message: "An error occurred while processing your request.",
//       success: false,
//     });
//   }
// };

// exports.consultantStatusUpdate = async (req, res) => {
//   try {
//     const { consultantId, consultantStatus } = req.body;

//     if (!consultantId || !consultantStatus) {
//       return res.send({
//         message: "Invalid data",
//         success: false,
//       });
//     }

//     const user = await User.findOne({ _id: consultantId });
//     if (!user) {
//       return res.status(404).json({
//         message: "No consultant found.",
//         success: false,
//       });
//     }

//     // Find the specific withdrawal object from their history
//     const update = {
//       $set: {
//         consultantStatus,
//       },
//     };
//     const result = await User.findOneAndUpdate({ _id: user._id }, update);
//     if (!result) {
//       res.send({
//         message: "same thing error here",
//         success: false,
//       });
//     }
//     res.send({
//       message: "Update completed",
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

// exports.allWithdrawalRequest = async (req, res) => {
//   try {
//     // Fetch only the 'history' field from all users
//     const users = await User.find({}, "history");

//     // Flatten all history arrays into a single array
//     const allHistory = users.flatMap((user) => user.history);
//     const filteredHistory = allHistory.filter(
//       (entry) => entry.historyType === "withdrawal"
//     );
//     res.send({
//       message: "All user history retrieved successfully.",
//       success: true,
//       data: filteredHistory,
//     });
//   } catch (error) {
//     console.log(error);
//     res.send({
//       message: "An error occurred while processing your request.",
//       success: false,
//     });
//   }
// };

// exports.getSingleWithdrawal = async (req, res) => {
//   try {
//     const { withdrawalId } = req.params;
//     const user = await User.findOne({ "history._id": withdrawalId });
//     if (!user) {
//       return res.status(404).json({
//         message: "No user found with this withdrawal request.",
//         success: false,
//       });
//     }

//     // Find the specific withdrawal object from their history
//     const withdrawal = user.history.find(
//       (item) => item._id.toString() === withdrawalId
//     );

//     if (!withdrawal) {
//       return res.status(404).json({
//         message: "Withdrawal not found in user history.",
//         success: false,
//       });
//     }

//     res.json({
//       message: "Withdrawal found.",
//       success: true,
//       withdrawal,
//     });
//   } catch (error) {
//     console.log(error);
//     res.send({
//       message: "An error occurred while processing your request.",
//       success: false,
//     });
//   }
// };

// exports.updateWithdrawalStatus = async (req, res) => {
//   try {
//     const { withdrawalId } = req.params;
//     const { status } = req.body;
//     console.log(status);

//     // // Validate input
//     if (!withdrawalId || !status) {
//       return res.status(400).json({
//         success: false,
//         message: "Withdrawal ID and status are required",
//       });
//     }

//     // Find user with the withdrawal request
//     const user = await User.findOne({ "history._id": withdrawalId });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "Withdrawal request not found",
//       });
//     }

//     // Find the specific withdrawal
//     const withdrawalIndex = user.history.findIndex(
//       (item) => item._id.toString() === withdrawalId
//     );

//     if (withdrawalIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: "Withdrawal not found in user history",
//       });
//     }

//     // Update withdrawal status
//     user.history[withdrawalIndex].status = status;

//     // Handle different statuses
//     const updateOperations = {
//       $set: {
//         history: user.history,
//       },
//     };

//     if (status === "Reject") {
//       // Refund balance when rejected
//       updateOperations.$inc = {
//         "balance.amount": user.history[withdrawalIndex].amount,
//       };
//     }

//     // Update user
//     await User.findByIdAndUpdate(user._id, updateOperations);

//     // Send success response
//     res.json({
//       success: true,
//       message: `Withdrawal ${status.toLowerCase()} successfully`,
//       data: {
//         withdrawal: user.history[withdrawalIndex],
//       },
//     });
//   } catch (error) {
//     console.error("Update withdrawal error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update withdrawal status",
//     });
//   }
// };

// exports.allTransaction = async (req, res) => {
//   try {
//     // Fetch only the 'history' field from all users
//     const users = await User.find({}, "history");
//     // Flatten all history arrays into a single array
//     const allHistory = users.flatMap((user) => user.history);
//     res.send({
//       message: "All user history retrieved successfully.",
//       success: true,
//       data: allHistory,
//     });
//   } catch (error) {
//     console.log(error);
//     res.send({
//       message: "An error occurred while processing your request.",
//       success: false,
//     });
//   }
// };

// exports.allContact = async (req, res) => {
//   try {
//     const contact = await Contact.find({});
//     if (!contact) {
//       return res.send({
//         message: "No contact found.",
//       });
//     }
//     res.send({
//       message: "All contact retrieved successfully.",
//       success: true,
//       data: contact,
//     });
//   } catch (error) {
//     console.log(error);
//     res.send({
//       message: "An error occurred while processing your request.",
//       success: false,
//     });
//   }
// };

// exports.deleteContact = async (req, res) => {
//   try {
//     const { contactId } = req.body;
//     const contact = await Contact.findByIdAndDelete(contactId);
//     if (!contact) {
//       return res.send({
//         message: "Contact not found.",
//         success: false,
//       });
//     }
//     res.send({
//       message: "Contact deleted successfully.",
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
