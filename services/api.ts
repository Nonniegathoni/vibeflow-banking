const getApiUrl = (): string => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        console.error("Error: NEXT_PUBLIC_API_URL environment variable is not set.");
        return 'http://localhost:5000/api'; // Adjust default if needed
    }
    return apiUrl;
};

const getAuthToken = (): string | null => {
    return localStorage.getItem("vibeflow-token");
};

const createAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};


import { Transaction } from "@/types";

export const getTransactions = async (limit = 10, offset = 0, sort = 'date', order = 'desc'): Promise<Transaction[]> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error("Unauthorized: No token found.");
    }

    const apiUrl = getApiUrl();
    const queryParams = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
        sort: sort,
        order: order
    });

    const response = await fetch(`${apiUrl}/transactions?${queryParams.toString()}`, {
        method: 'GET',
        headers: createAuthHeaders(),
    });

    if (response.status === 401) {
        throw new Error("Unauthorized: Invalid or expired token.");
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const transactions = data.transactions || [];

    // Map the API response to the Transaction interface from types/index.ts
    return transactions.map((transaction: any) => {
      const createdAt = new Date(transaction.created_at).toISOString();
      const isSuspicious = transaction.is_suspicious || false;
      return {
        id: String(transaction.id),
        userId: transaction.userId || "unknown", //API does not return userId, setting to unknown
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        timestamp: new Date(transaction.created_at).getTime(),
        status: "completed", //API does not return status, setting to completed
        riskScore: transaction.is_suspicious ? 1 : 0,
        createdAt: createdAt,
        isSuspicious: isSuspicious,
      };
    });
};

export const register = async (name: string, email: string, password: string, phone: string): Promise<any> => {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
};

export const reportFraud = async (transactionId: string): Promise<void> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error("Unauthorized: No token found.");
    }
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/transactions/report/${transactionId}`, {
        method: 'POST',
        headers: createAuthHeaders(),
    });

    if (response.status === 401) {
        throw new Error("Unauthorized: Invalid or expired token.");
    }
    if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
};

export const getUserProfile = async (): Promise<any> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error("Unauthorized: No token found.");
    }
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/profile`, {
        method: 'GET',
        headers: createAuthHeaders(),
    });

    if (response.status === 401) {
        throw new Error("Unauthorized: Invalid or expired token.");
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
};

export const updateUserProfile = async (name: string, email: string, phone: string): Promise<any> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error("Unauthorized: No token found.");
    }
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/profile`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify({ name, email, phone }),
    });

    if (response.status === 401) {
        throw new Error("Unauthorized: Invalid or expired token.");
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
};
