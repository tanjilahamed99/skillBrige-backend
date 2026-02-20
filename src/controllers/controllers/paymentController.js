// const Razorpay = require("../models/Razorpay");
// const Razorpays = require("razorpay");
// const crypto = require("crypto");
// const User = require("../models/User");
// const Paygic = require("../models/Paygic");
// const { default: axios } = require("axios");

// exports.razorpay = async (req, res) => {
//   try {
//     const { id, email } = req.params;
//     const findUser = await User.findOne({ _id: id, email });
//     if (!findUser) {
//       return res.send({
//         message: "Invalid Data",
//         success: false,
//       });
//     }
//     const settings = await Razorpay.findOne(); // Only one document expected
//     if (!settings) {
//       return res.status(404).json({
//         message: "Website settings not found",
//         success: false,
//       });
//     }

//     if (findUser.level === "root" || findUser.level === "admin") {
//       return res.json({ success: true, data: settings });
//     } else {
//       return res.json({ success: true, data: { key: settings.key } });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Error fetching website settings",
//       success: false,
//     });
//   }
// };

// exports.createPaymentIntent = async (req, res) => {
//   try {
//     const keys = await Razorpay.findOne();

//     if (!keys) {
//       return res.send({
//         success: false,
//         message: "Something is wrong",
//       });
//     }
//     const razorpay = new Razorpays({
//       key_id: keys.key,
//       key_secret: keys.secret,
//     });

//     const options = req.body;
//     const order = await razorpay.orders.create(options);

//     if (!order) {
//       return res.status(500).send("Error");
//     }

//     res.json(order);
//   } catch (err) {
//     console.log(err);
//     res.status(500).send("Error");
//   }
// };

// exports.razorpayPaymentValidate = async (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//     req.body;
//   const keys = await Razorpay.findOne();
//   if (!keys) {
//     return res.send({
//       success: false,
//       message: "Something is wrong",
//     });
//   }
//   const sha = crypto.createHmac("sha256", keys.secret);
//   //order_id + "|" + razorpay_payment_id
//   sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
//   const digest = sha.digest("hex");
//   if (digest !== razorpay_signature) {
//     return res.status(400).json({ msg: "Transaction is not legit!" });
//   }

//   res.json({
//     msg: "success",
//     orderId: razorpay_order_id,
//     paymentId: razorpay_payment_id,
//   });
// };

// exports.topUp = async (req, res) => {
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
//     const { amount, paymentMethod, razorpay, author, paygic } = req.body;
//     let history = [];
//     if (isExistingUser.history.length > 0) {
//       history = [
//         ...isExistingUser.history,
//         {
//           historyType: "top-up",
//           amount,
//           paymentMethod,
//           status: "Completed",
//           razorpay,
//           author,
//           paygic,
//         },
//       ];
//     } else {
//       history = [
//         {
//           historyType: "top-up",
//           amount,
//           paymentMethod,
//           status: "Completed",
//           razorpay,
//           author,
//           paygic,
//         },
//       ];
//     }
//     const updateUserData = await User.findOneAndUpdate(
//       { _id: id },
//       {
//         $set: {
//           history,
//           balance: {
//             amount: isExistingUser.balance.amount + parseFloat(amount),
//           },
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
//       message: "Top-up successfully.",
//       success: true,
//       data: {
//         amount,
//         paymentMethod,
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     res.send({
//       message: "An error occurred while processing your request.",
//       success: false,
//     });
//   }
// };

// exports.paygic = async (req, res) => {
//   try {
//     const { amount, userId } = req.body;

//     const keys = await Paygic.findOne();
//     const frontendUrl = process.env.FRONTEND_URL;

//     if (!keys) {
//       return res.send({
//         success: false,
//         message: "Something is wrong",
//       });
//     }

//     if (!amount || !userId) {
//       return res.send({
//         message: "Invalid data",
//         success: false,
//       });
//     }

//     const user = await User.findOne({ _id: userId });

//     if (!user) {
//       return res.send({
//         message: "User not found",
//         success: false,
//       });
//     }

//     // Generate a unique receipt ID
//     const receiptId = `REC-${Date.now()}-${Math.floor(
//       Math.random() * 1000000
//     )}`;

//     const { data } = await axios.post(
//       "https://server.paygic.in/api/v3/createMerchantToken",
//       {
//         mid: keys.mid,
//         password: keys.password,
//         expiry: false,
//       }
//     );

//     const { data: response } = await axios.post(
//       "https://server.paygic.in/api/v2/createPaymentPage",
//       {
//         mid: keys.mid, // Merchant ID
//         merchantReferenceId: receiptId, // Unique reference ID
//         amount: String(amount), // Amount
//         customer_mobile: "4355435545",
//         customer_name: user.firstName,
//         customer_email: user.email,
//         redirect_URL: `${frontendUrl}/monetization/success?refId=${receiptId}`,
//         failed_URL: `${frontendUrl}/monetization/failed`,
//       },
//       {
//         headers: {
//           token: data.data.token,
//         },
//       }
//     );
//     if (response.status) {
//       return res.send({
//         success: true,
//         payPageUrl: response.data.payPageUrl,
//         message: response.msg,
//       });
//     } else {
//       return res.send({
//         success: false,
//         message: "Same thing error here",
//       });
//     }
//   } catch (error) {
//     console.error("❌ Server Error:", error);
//     return res.status(500).json({
//       message: "An error occurred while processing your payout.",
//       success: false,
//       error: error.message,
//     });
//   }
// };
// exports.paygicPaymentValidate = async (req, res) => {
//   try {
//     const { merchantReferenceId, userId } = req.body;

//     const keys = await Paygic.findOne();

//     if (!keys) {
//       return res.send({
//         success: false,
//         message: "Something is wrong",
//       });
//     }

//     // Basic validation
//     if (!merchantReferenceId || !userId) {
//       return res.status(400).send({
//         message: "merchantReferenceId and userId are required",
//         success: false,
//       });
//     }

//     const findUser = await User.findById(userId);

//     if (!findUser) {
//       return res.status(404).send({
//         message: "User not found",
//         success: false,
//       });
//     }

//     // Check if merchantReferenceId already exists in user's history
//     // Check ALL users if this merchantReferenceId exists
//     const idUsed = await User.findOne({
//       'history.paygic.merchantReferenceId': merchantReferenceId,
//     });

//     if (idUsed) {
//       return res.status(400).send({
//         message: 'This payment ID has already been processed.',
//         success: false,
//       });
//     }

//     // Create merchant token from Paygic
//     const { data: tokenData } = await axios.post(
//       "https://server.paygic.in/api/v3/createMerchantToken",
//       {
//         mid: keys.mid,
//         password: keys.password,
//         expiry: false,
//       }
//     );

//     // Check payment status from Paygic
//     const { data: paymentStatus } = await axios.post(
//       "https://server.paygic.in/api/v2/checkPaymentStatus",
//       {
//         mid: keys.mid,
//         merchantReferenceId,
//       },
//       {
//         headers: {
//           token: tokenData.data.token,
//         },
//       }
//     );

//     if (!paymentStatus.status) {
//       return res.status(300).send({
//         message: "Payment Error",
//         success: false,
//       });
//     }

//     const paygic = {
//       merchantReferenceId: paymentStatus?.data?.merchantReferenceId,
//       paygicReferenceId: paymentStatus?.data?.paygicReferenceId,
//     };

//     // Create transaction record
//     const transactionRecord = {
//       paygic,
//       amount: paymentStatus.data.amount,
//       paymentMethod: "Paygic",
//       historyType: "top-up",
//       status: "completed",
//       author: {
//         name: `${findUser.firstName}${" "}${findUser.lastName}`,
//         email: findUser.email,
//         id: findUser.id,
//       },
//     };

//     // Update both users in a single database transaction if using MongoDB transactions
//     // For simplicity, updating sequentially. Consider using transactions for atomic updates.

//     // Update my account
//     const myUpdate = await User.findOneAndUpdate(
//       { _id: userId },
//       {
//         $set: { balance: { amount: findUser.balance.amount + parseFloat(paymentStatus.data.amount) } },
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
//     res.send({
//       message: "Payment status checked",
//       success: true,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       message: "Server error",
//       success: false,
//       error: error.message,
//     });
//   }
// };

// exports.withdrawRequest = async (req, res) => {
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
//     const { withdrawalAmount, ...rest } = req.body;

//     if (isExistingUser.balance.amount < withdrawalAmount) {
//       return res.status(400).send({
//         message: "Insufficient balance for withdrawal.",
//         success: false,
//       });
//     }

//     let history = [];

//     if (isExistingUser.history.length > 0) {
//       history = [
//         ...isExistingUser.history,
//         {
//           historyType: "withdrawal",
//           amount: withdrawalAmount,
//           ...rest,
//           status: "pending",
//         },
//       ];
//     } else {
//       history = [
//         {
//           historyType: "withdrawal",
//           amount: withdrawalAmount,
//           ...rest,
//           status: "pending",
//         },
//       ];
//     }

//     const updateUserData = await User.findOneAndUpdate(
//       { _id: id },
//       {
//         $set: {
//           history,
//           balance: {
//             amount: isExistingUser.balance.amount - withdrawalAmount,
//           },
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
//       message: "Withdrawal request sent successfully.",
//       success: true,
//       data: {
//         withdrawalAmount,
//         ...rest,
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     res.send({
//       message: "An error occurred while processing your request.",
//       success: false,
//     });
//   }
// };
