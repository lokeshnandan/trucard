import { z } from "zod";

export const mobileSchema = z
	.string()
	.trim()
	.regex(/^[6-9][0-9]{9}$/i, "Enter a valid 10-digit mobile");

export const emailSchema = z
	.string()
	.trim()
	.email("Enter a valid email address");

export const otpSchema = z
	.string()
	.trim()
	.length(6, "Enter 6-digit OTP")
	.regex(/^[0-9]{6}$/, "OTP must be digits only");

export const aadhaarSchema = z
	.string()
	.trim()
	.length(12, "Enter 12-digit Aadhaar")
	.regex(/^[0-9]{12}$/i, "Aadhaar must be digits only");

export const panSchema = z
	.string()
	.trim()
	.regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, "Enter valid PAN (ABCDE1234F)");

