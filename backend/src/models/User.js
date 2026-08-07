import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    avatarUrl: { type: String, default: "" },
    manualStatus: {
      type: String,
      enum: ["away", "busy", "in_meeting", null],
      default: null,
    },
    statusMessage: { type: String, default: "", trim: true },
    isEmailVerified: { type: Boolean, default: false },
    language: { type: String, default: "en" },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatarUrl: this.avatarUrl,
    manualStatus: this.manualStatus,
    statusMessage: this.statusMessage,
    isEmailVerified: this.isEmailVerified,
    language: this.language,
  };
};

export default mongoose.model("User", userSchema);
