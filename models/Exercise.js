import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
	{
		user_id: mongoose.Schema.Types.ObjectId,
		username: String,
		description: String,
		duration: Number,
		date: String
	}
)

const Exercise = mongoose.model("Exercise", exerciseSchema);

export default Exercise;