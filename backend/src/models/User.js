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
    password: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    avatarUrl: { type: String, default: "" },
    manualStatus: {
      type: String,
      enum: ["away", "busy", "in_meeting", null],
      default: null,
    },
    statusMessage: { type: String, default: "", trim: true },
    isEmailVerified: { type: Boolean, default: false },
    language: { type: String, default: "en" },
    // Platform-level role — separate from any workspace membership.
    // Grants access to the /admin panel across all workspaces.
    isSuperAdmin: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    avatarUrl: this.avatarUrl,
    manualStatus: this.manualStatus,
    statusMessage: this.statusMessage,
    isEmailVerified: this.isEmailVerified,
    language: this.language,
    isSuperAdmin: this.isSuperAdmin,
    isSuspended: this.isSuspended,
  };
};

export default mongoose.model("User", userSchema);
