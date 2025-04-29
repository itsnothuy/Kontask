'use client';

import { Input } from "@heroui/input";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { useState, useCallback } from "react";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/auth";
import toast, { Toaster } from 'react-hot-toast';


export default function LoginPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [invalidCredentials, setInvalidCredentials] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isEmpty = (value: string) => value === "";

    const handleLogin = useCallback(
        async () => {
            setIsLoading(true);
            const result = await loginUser({ username, password });
            if (result) {
                const { data }: { data: any } = result;
                if (data.detail !== "Not Found") {
                    console.log(data)
                    console.log("successful signup");
                    toast.success("Login successful");
                    setTimeout(() => {
                        router.replace("/home");
                        setIsLoading(false);
                    }, 2000);
                } else {
                    console.log(data)
                    setInvalidCredentials(true);
                    toast.error("Invalid Credential");
                }
            } else {
                setInvalidCredentials(true);
                setIsLoading(false);
                toast.error("Server Internal Error");
            }
        },
        [router, invalidCredentials, username, password]
    );

    const handleUsernameInput = useCallback(
        async (usernameInput: string) => {
            setUsername(usernameInput);
            setInvalidCredentials(false);
        },
        [username, invalidCredentials]
    );

    const handlePasswordInput = useCallback(
        async (passwordInput: string) => {
            setPassword(passwordInput);
            setInvalidCredentials(false);
        },
        [password, invalidCredentials]
    );


    return (
        <>
            <Toaster />
            <Card className="py-4 w-[400px] h-auto border border-coolGray-700">
                <CardHeader className="justify-between pb-0 pt-2 px-4 flex-col">
                    <div className="font-bold text-xl">Welcome ✌️</div>
                </CardHeader>
                <CardBody className="flex w-full flex-wrap flex-col md:mb-0 gap-4 py-8 px-8">
                    <Input
                        key="username"
                        variant='bordered'
                        type='username'
                        label='Username'
                        value={username}
                        isInvalid={invalidCredentials}
                        color={invalidCredentials ? "danger" : "default"}
                        errorMessage="Invalid username or password"
                        onValueChange={handleUsernameInput}
                    />
                    <Input
                        key="password"
                        variant='bordered'
                        label='Password'
                        type='password'
                        value={password}
                        isInvalid={invalidCredentials}
                        color={invalidCredentials ? "danger" : "default"}
                        errorMessage="Invalid email or password"
                        onValueChange={handlePasswordInput}
                    />
                    <Button
                        color="primary"
                        type='submit'
                        className=" w-full gradient-button"
                        isDisabled={isEmpty(username) || isEmpty(password)}
                        onPress={handleLogin}
                    >
                        Continue
                    </Button>
                    <div className='text-sm'>
                        Need to create an account?{" "}<Link href='signup' className='gradient-text'>
                            Sign up
                        </Link>
                    </div>
                </CardBody>
            </Card>
        </>

    );
}
