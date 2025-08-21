import axios, { AxiosResponse, AxiosError } from "axios";
import { toast } from "sonner";

// API Configuration
const API_BASE_URL = "https://auth-uat.bhugtan.in";

export const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: { 
		"Content-Type": "application/json",
		"Accept": "application/json"
	},
	timeout: 10000, // 10 seconds
});

// Request interceptor for logging and auth headers
apiClient.interceptors.request.use(
	(config) => {
		// Add auth token if available
		const token = localStorage.getItem("auth_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
	(response: AxiosResponse) => response,
	(error: AxiosError) => {
		if (error.response?.status === 401) {
			// Handle unauthorized - clear token and redirect to login
			localStorage.removeItem("auth_token");
			window.location.href = "/auth/login";
		}
		return Promise.reject(error);
	}
);

// API Response Types
export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

// Updated to match real API response shape
export interface LoginResponse {
    status: number;
    message: string;
    user_id: string;
    access_token: string;
    last_login_time?: string;
    device?: string;
    ip?: string;
    permissions?: Record<string, unknown>; // keep flexible for nested permissions
}

export interface OtpRequest {
    mobile?: string;
    email?: string;
    aadhaar?: string;
}

export interface OtpVerifyRequest {
	otp: string;
	reference?: string; // For tracking OTP requests
}

// Real API Functions
export async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
        const response = await apiClient.post("/secure/login", credentials);
        // store access token when returned
        if (response.data?.access_token) {
            localStorage.setItem("auth_token", response.data.access_token);
        }
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        return {
            success: false,
            error: (axiosError.response?.data as { message?: string })?.message || (error as Error).message || "Login failed"
        };
    }
}

export async function sendOtp(request: OtpRequest): Promise<ApiResponse<{ reference: string }>> {
	try {
		const response = await apiClient.post("/auth/send-otp", request);
		return { success: true, data: response.data };
	} catch (error: unknown) {
		const axiosError = error as AxiosError;
		return {
			success: false,
			error: (axiosError.response?.data as { message?: string })?.message || (error as Error).message || "Failed to send OTP"
		};
	}
}

export async function verifyOtp(
    request: OtpVerifyRequest,
    verificationType: "mobile" | "email" = "mobile"
): Promise<ApiResponse<{ verified: boolean }>> {
    try {
        // choose ref key based on verification type
        const refKey =
            verificationType === "email" ? "registration_ref_id_email" : "registration_ref_id";

        // prefer provided reference, fallback to stored ref depending on type
        const refId = request.reference ?? localStorage.getItem(refKey);
        if (!refId) {
            return { success: false, error: `Missing ${refKey} for OTP verification` };
        }

        const payload = {
            ref_id: refId,
            otp: request.otp,
        };

        const response = await apiClient.post("/secure/verify-otp", payload);
        const data = response.data as { message?: string; urn?: string; purpose?: string; status?: number };

        // store urn for later use if returned
        if (data?.urn) {
            localStorage.setItem("registration_urn", data.urn);
        }

        // show message in toast if present
        if (data?.message) {
            toast.success(data.message);
        }

        const verified = data?.status === 200 && Boolean(data?.urn);

        return { success: true, data: { verified } };
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        return {
            success: false,
            error:
                (axiosError.response?.data as { message?: string })?.message ||
                (error as Error).message ||
                "OTP verification failed",
        };
    }
}

export async function sendPasswordReset(username: string): Promise<ApiResponse<{ message: string }>> {
    try {
        const payload = {
            username,
            type: "both",
            purpose: "FORGOT_PASSWORD"
        };
        const response = await apiClient.post("/secure/forgot-password", payload);

        // show success toast with friendly message
        const msg = (response.data && (response.data.message as string)) || "Reset link sent to registered email";
        toast.success(msg);

        return { success: true, data: response.data };
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        return {
            success: false,
            error: (axiosError.response?.data as { message?: string })?.message || (error as Error).message || "Failed to send reset link"
        };
    }
}

export async function forgotUsername(mobile: string): Promise<ApiResponse<{ username: string }>> {
    try {
        const payload = {
            mobile,
            purpose: "USERNAME_FORGOT",
            user_type: "RETAILER"
        };
        const response = await apiClient.post("/secure/username-forgot", payload);
        return { success: true, data: response.data };
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        return {
            success: false,
            error: (axiosError.response?.data as { message?: string })?.message || (error as Error).message || "Failed to retrieve username"
        };
    }
}

export async function generateEmailKycOtp(email: string): Promise<ApiResponse<{ message: string; ref_id: string; otp_code?: string; status: number }>> {
    try {
        const urn = localStorage.getItem("registration_urn");
        if (!urn) {
            return { success: false, error: "Missing registration urn. Please complete SMS verification first." };
        }

        const payload = {
            email,
            urn
        };
        const response = await apiClient.post("/secure/generate-email-otp", payload);
        const data = response.data as { message?: string; ref_id?: string; otp_code?: string; status?: number };

        // store email ref_id for later use
        if (data?.ref_id) {
            localStorage.setItem("registration_ref_id_email", data.ref_id);
        }

        // show OTP in toast if returned
        const otpText = data?.otp_code ? ` OTP: ${data.otp_code}.` : "";
        if (data?.message) {
            toast.success(`${data.message}${otpText}`);
        } else {
            toast.success(`Email OTP sent.${otpText}`);
        }

        return { success: true, data: data as { message: string; ref_id: string; otp_code?: string; status: number } };
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        return {
            success: false,
            error: (axiosError.response?.data as { message?: string })?.message || (error as Error).message || "Failed to generate email OTP"
        };
    }
}

export async function createRegistration(mobile: string): Promise<ApiResponse<{ message: string; ref_id: string; otp_code: string; status: number }>> {
    try {
        const payload = {
            mobile,
            purpose: "REGISTRATION",
            user_type: "RETAILER",
        };
        const response = await apiClient.post("/secure/create", payload);
        const data = response.data as { message: string; ref_id: string; otp_code: string; status: number };
        // store ref_id for later use
        if (data?.ref_id) {
            localStorage.setItem("registration_ref_id", data.ref_id);
            const otpText = data?.otp_code ? ` OTP: ${data.otp_code}.` : "";
            toast.success(`Registration initiated.${otpText} Please verify your mobile number.`);
        }
        return { success: true, data };
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        return {
            success: false,
            error: (axiosError.response?.data as { message?: string })?.message || (error as Error).message || "Failed to create registration",
        };
    }
}

export async function generateAadhaarOtp(aadhaarNumber: string): Promise<ApiResponse<{ message?: string; ref_id?: string; otp_code?: string; status?: number }>> {
    try {
        // urn is stored under registration_urn per request
        const urn = localStorage.getItem("registration_urn");
        if (!urn) {
            return { success: false, error: "Missing registration_urn. Please complete prior verification first." };
        }

        const payload = {
            urn,
            aadhaar_number: aadhaarNumber,
        };

        const response = await apiClient.post("/secure/aadhar-otp-generate", payload);
        const data = response.data as { message?: string; ref_id?: string; otp_code?: string; status?: number };

        // store aadhar ref id for later use
        if (data?.ref_id) {
            localStorage.setItem("aadhar_ref", String(data.ref_id));
        }

        // show toast notification (include OTP if returned)
        const otpText = data?.otp_code ? ` OTP: ${data.otp_code}.` : "";
        if (data?.message) {
            toast.success(`${data.message}${otpText}`);
        } else {
            toast.success(`Aadhaar OTP sent.${otpText}`);
        }

        return { success: true, data };
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        return {
            success: false,
            error: (axiosError.response?.data as { message?: string })?.message || (error as Error).message || "Failed to generate Aadhaar OTP",
        };
    }
}

export async function verifyAadhaarOtp(otp: string): Promise<ApiResponse<{ message?: string; verified?: boolean; status?: number }>> {
    try {
        const urn = localStorage.getItem("registration_urn");
        if (!urn) {
            return { success: false, error: "Missing registration urn. Please complete prior verification." };
        }

        const refId = localStorage.getItem("aadhar_ref");
        if (!refId) {
            return { success: false, error: "Missing aadhar_ref. Please request Aadhaar OTP first." };
        }

        const payload = {
            urn,
            otp,
            ref_id: refId,
        };

        const response = await apiClient.post("/secure/aadhar-otp-verify", payload);
        const data = response.data as { message?: string; verified?: boolean; status?: number };

        if (data?.message) {
            toast.success(data.message);
        }

        return { success: true, data: { message: data?.message, verified: data?.verified ?? (data?.status === 200), status: data?.status } };
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        return {
            success: false,
            error: (axiosError.response?.data as { message?: string })?.message || (error as Error).message || "Aadhaar OTP verification failed",
        };
    }
}

export async function verifyPanNumber(panNumber: string): Promise<ApiResponse<{ message?: string; verified?: boolean; status?: number }>> {
    try {
        const urn = localStorage.getItem("registration_urn");
        if (!urn) {
            return { success: false, error: "Missing registration urn. Please complete prior verification." };
        }

        const payload = {
            urn,
            pan_number: panNumber,
        };

        const response = await apiClient.post("/secure/pan-verify", payload);
        const data = response.data as {
            message?: string;
            preview_data?: {
                address?: string;
                registered_name?: string;
                urn?: string;
                [k: string]: unknown;
            };
            verified?: boolean;
            status?: number;
        };

        // persist preview details for further use
        if (data?.preview_data) {
            const registeredName = data.preview_data.registered_name;
            const address = data.preview_data.address;
            if (registeredName) localStorage.setItem("pan_registered_name", registeredName);
            if (address) localStorage.setItem("pan_address", address);
        }

        if (data?.message) {
            toast.success(data.message);
        }

        return {
            success: true,
            data: {
                message: data?.message,
                verified: data?.verified ?? (data?.status === 200),
                status: data?.status,
            },
        };
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        return {
            success: false,
            error: (axiosError.response?.data as { message?: string })?.message || (error as Error).message || "PAN verification failed",
        };
    }
}

export async function registerAccount(acceptedTerms: boolean): Promise<ApiResponse<{ message?: string; status?: number }>> {
    try {
        const urn = localStorage.getItem("registration_urn");
        if (!urn) {
            return { success: false, error: "Missing registration urn. Please complete prior verification." };
        }

        const payload = {
            urn,
            accepted_terms: acceptedTerms,
        };

        const response = await apiClient.post("/secure/register", payload);
        const data = response.data as { message?: string; status?: number };

        if (data?.message) {
            toast.success(data.message);
        }

        return { success: true, data: { message: data?.message, status: data?.status } };
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        return {
            success: false,
            error: (axiosError.response?.data as { message?: string })?.message || (error as Error).message || "Registration failed",
        };
    }
}

export async function resetPassword(): Promise<ApiResponse<{ message?: string; status?: number }>> {
    try {
        const payload = {
            user_id: "bfb3597d-d937-43d2-b7bd-bcb7d8305576",
            purpose: "password_reset",
        };

        const response = await apiClient.post("/secure/reset-password", payload);
        const data = response.data as { message?: string; ref_id?: string; otp_code?: string; status?: number };

        // store ref_id for reset flow
        if (data?.ref_id) {
            localStorage.setItem("registration_ref_id_reset", String(data.ref_id));
        }

        // show toast with message and OTP if provided
        const otpText = data?.otp_code ? ` OTP: ${data.otp_code}.` : "";
        if (data?.message) {
            toast.success(`${data.message}${otpText}`);
        }

        return { success: true, data: { message: data?.message, status: data?.status } };
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        return {
            success: false,
            error: (axiosError.response?.data as { message?: string })?.message || (error as Error).message || "Reset password failed",
        };
    }
}

export async function verifyResetPassword(otp: string, password: string): Promise<ApiResponse<{ message?: string; status?: number }>> {
    try {
        const refId = localStorage.getItem("registration_ref_id_reset");
        if (!refId) {
            return { success: false, error: "Missing registration_ref_id_reset. Please request password reset OTP first." };
        }

        const payload = {
            ref_id: refId,
            user_id: "bfb3597d-d937-43d2-b7bd-bcb7d8305576",
            password,
            otp,
        };

        const response = await apiClient.post("/secure/verify-otp-password", payload);
        const data = response.data as { message?: string; status?: number };

        if (data?.message) {
            toast.success(data.message);
        }

        return { success: true, data: { message: data?.message, status: data?.status } };
    } catch (error: unknown) {
        const axiosError = error as AxiosError;
        return {
            success: false,
            error: (axiosError.response?.data as { message?: string })?.message || (error as Error).message || "Password reset verification failed",
        };
    }
}

// Mock functions for demo/fallback (keep for development)
export async function mockDelay<T>(data: T, ms = 800): Promise<T> {
	return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export async function mockSendOtp(): Promise<ApiResponse<{ reference: string }>> {
	await mockDelay(null, 800);
	return { success: true, data: { reference: "mock_ref_123" } };
}

export async function mockVerifyOtp(otp: string): Promise<ApiResponse<{ verified: boolean }>> {
	await mockDelay(null, 800);
	const success = otp === "123456"; // demo OTP
	return { success: true, data: { verified: success } };
}

export async function mockSendPasswordReset(): Promise<ApiResponse<{ message: string }>> {
	await mockDelay(null, 800);
	return { success: true, data: { message: "Reset link sent to registered email" } };
}

export async function mockForgotUsername(): Promise<ApiResponse<{ username: string }>> {
	await mockDelay(null, 800);
	return { success: true, data: { username: "RA176900435" } };
}


