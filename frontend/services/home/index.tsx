"use server"

import config from "@/app/config";
import { CreateResumeInput } from "@/services/constants";
import { cookies } from 'next/headers'
import { renewToken } from "../auth";

const API_URL = config.API_SERVER;
const MAX_NUMBER_OF_TRIES = 3


export const getUser = async (): Promise<{ data: any }> => {
    try {
        for (let tries = 0; tries < MAX_NUMBER_OF_TRIES; tries++) {
            const cookieStore = await cookies();
            const userId = cookieStore.get('user_id')?.value;
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                },
            });
            const data = await response.json();

            if (response) {
                return { data };
            }
        }
    } catch (error) {
        console.error('Cannot get the posts info:', error);
        throw error;
    }

    return { data: null };
};

export const getUserByID = async (user_id: string): Promise<{ data: any }> => {
    try {
        for (let tries = 0; tries < MAX_NUMBER_OF_TRIES; tries++) {
            const response = await fetch(`${API_URL}/users/${user_id}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                },
            });
            const data = await response.json();

            if (response) {
                return { data };
            }
        }
    } catch (error) {
        console.error('Cannot get the posts info:', error);
        throw error;
    }

    return { data: null };
};

export const getPostsByUserID = async (): Promise<{ data: any }> => {
    try {
        for (let tries = 0; tries < MAX_NUMBER_OF_TRIES; tries++) {
            const cookieStore = await cookies();
            const userId = cookieStore.get('user_id')?.value;
            const response = await fetch(`${API_URL}/posts/user/${userId}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                },
            });
            const data = await response.json();

            if (response) {
                return { data };
            }
        }
    } catch (error) {
        console.error('Cannot get the posts info:', error);
        throw error;
    }

    return { data: null };
};

export const getPostByID = async (post_id: string): Promise<{ data: any }> => {
    try {
        for (let tries = 0; tries < MAX_NUMBER_OF_TRIES; tries++) {
            const response = await fetch(`${API_URL}/posts/${post_id}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                },
            });
            const data = await response.json();

            if (response.ok === true) {
                return { data };
            }
        }
    } catch (error) {
        console.error('Cannot get the post info:', error);
        throw error;
    }

    return { data: null };
};

export const matchPost = async (content: string): Promise<{ data: any; }> => {
    try {
        for (let tries = 0; tries < MAX_NUMBER_OF_TRIES; tries++) {
            const cookieStore = await cookies();
            const userId = cookieStore.get('user_id')?.value;
            const response = await fetch(`${API_URL}/search_for_supplier/`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    query: content,
                    requester_id: userId,
                }),
            });

            const data = await response.json();
            return { data };
        }
    } catch (error) {
        console.error('Cannot get the post info:', error);
        throw error;
    }

    return { data: null };
};

