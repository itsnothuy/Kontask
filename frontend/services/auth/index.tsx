"use server"

import config from "@/app/config";
import { CreateUserInput, LoginUserInput, UpdateUserInput } from "@/services/constants";
import { cookies } from 'next/headers'

const API_URL = config.API_SERVER;
const MAX_NUMBER_OF_TRIES = 3

export const loginUser = async (loginUserInput: LoginUserInput) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(loginUserInput),
        });
        const data = await response.json();
        if (response) {
            const cookieStore = await cookies();
            cookieStore.set('user_id', data.id);
        }
        return { data };
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('access_token');
        cookieStore.delete('refresh_token');
        cookieStore.delete('user_id');
    } catch (error) {
        console.error('Error logging out:', error);
        throw error;
    }
};

export const createUser = async (createUserInput: CreateUserInput) => {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(createUserInput),
        });
        const data = await response.json();

        return { data };
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const updateUser = async (updateUserInput: UpdateUserInput): Promise<{ data: any; ok: boolean }> => {
    try {
        for (let tries = 0; tries < MAX_NUMBER_OF_TRIES; tries++) {
            const cookieStore = await cookies();
            const access_token = cookieStore.get('access_token')?.value;
            const userId = cookieStore.get('user_id')?.value;

            const response = await fetch(`${API_URL}/update_user/${userId}`, {
                method: "PUT",
                headers: {
                    "content-type": "application/json",
                    "Authorization": `Bearer ${access_token}`,
                },
                body: JSON.stringify(updateUserInput),
            });
            const data = await response.json();
            if (response.ok === true) {
                return { data, ok: response.ok };
            } else {
                await renewToken();
            }
        }
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
    return { data: null, ok: false };
}

export const renewToken = async () => {
    try {
        const cookieStore = await cookies();
        const refresh_token = cookieStore.get('refresh_token')?.value;
        const response = await fetch(`${API_URL}/renew_access_token`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ refresh_token: refresh_token }),
        });
        const data = await response.json();

        if (response.ok) {
            cookieStore.set('access_token', data.access_token.token)
        }

        return { data: cookieStore.get('access_token')?.value, ok: response.ok };
    } catch (error) {
        console.error('Error renew token:', error);
        throw error;
    }
};