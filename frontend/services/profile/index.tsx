"use server"

import config from "@/app/config";
import { CreateResumeInput } from "@/services/constants";
import { cookies } from 'next/headers'
import { renewToken } from "../auth";

const API_URL = config.API_SERVER;
const MAX_NUMBER_OF_TRIES = 3

export const getProfile = async (): Promise<{ data: any; ok: boolean }> => {
    try {
        for (let tries = 0; tries < MAX_NUMBER_OF_TRIES; tries++) {
            const cookieStore = await cookies();
            const access_token = cookieStore.get('access_token')?.value;
            const userId = cookieStore.get('user_id')?.value;
            const response = await fetch(`${API_URL}/get_user/${userId}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                    "Authorization": `Bearer ${access_token}`,
                },
            });
            const data = await response.json();

            if (response.ok === true) {
                return { data, ok: response.ok };
            } else {
                await renewToken();
            }
        }
    } catch (error) {
        console.error('Cannot get the profile info:', error);
        throw error;
    }

    return { data: null, ok: false };
};

export const updateResume = async (): Promise<{ data: any; ok: boolean }> => {
    try {
        for (let tries = 0; tries < MAX_NUMBER_OF_TRIES; tries++) {

            const cookieStore = await cookies();
            const access_token = cookieStore.get('access_token')?.value;
            const userId = cookieStore.get('user_id')?.value;

            const response = await fetch(`${API_URL}/update_resume`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "Authorization": `Bearer ${access_token}`,
                },
                body: JSON.stringify(userId),
            });
            const data = await response.json();

            if (response.ok === true) {
                return { data, ok: response.ok };
            } else {
                await renewToken();
            }
        }
    } catch (error) {
        console.error('Cannot get the profile info:', error);
        throw error;
    }

    return { data: null, ok: false };

};

export const getResume = async (): Promise<{ data: any; ok: boolean }> => {
    try {
        for (let tries = 0; tries < MAX_NUMBER_OF_TRIES; tries++) {

            const cookieStore = await cookies();
            const access_token = cookieStore.get('access_token')?.value;
            const userId = cookieStore.get('user_id')?.value;

            const response = await fetch(`${API_URL}/get_resume/${userId}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                    "Authorization": `Bearer ${access_token}`,
                },
            });
            const data = await response.json();

            if (response.ok === true) {
                return { data, ok: response.ok };
            } else {
                await renewToken();
            }
        }
    } catch (error) {
        console.error('Cannot get the resume info:', error);
        throw error;
    }

    return { data: null, ok: false };
}

export const createResume = async (createResumeInput: CreateResumeInput): Promise<{ data: any; ok: boolean }> => {
    try {
        for (let tries = 0; tries < MAX_NUMBER_OF_TRIES; tries++) {
            const cookieStore = await cookies();
            const access_token = cookieStore.get('access_token')?.value;
            const userId = cookieStore.get('user_id')?.value;

            const response = await fetch(`${API_URL}/create_resume`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "Authorization": `Bearer ${access_token}`,
                },
                body: JSON.stringify({
                    user_id: userId,
                    ...createResumeInput
                }),
            });
            const data = await response.json();

            if (response.ok === true) {
                return { data, ok: response.ok };
            } else {
                await renewToken();
            }
        }
    } catch (error) {
        console.error('Cannot get the resume info:', error);
        throw error;
    }

    return { data: null, ok: false };
};
