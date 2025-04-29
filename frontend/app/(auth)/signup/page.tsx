'use client';

import { Input, Button, Card, CardBody, CardHeader, } from "@heroui/react";
import { useState } from "react";
import React, { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/services/auth";
import toast, { Toaster } from 'react-hot-toast';

export default function SignUpPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const validateEmail = (email: string) => email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

    const isEmpty = (value: string) => value === "";

    const isInvalidEmail = useMemo(() => {
        if (email === "") return false;

        return validateEmail(email) ? false : true;
    }, [email]);

    const isInvalidConfirmedPassword = useMemo(() => {
        if (confirmedPassword === "") return false;

        return confirmedPassword !== password;
    }, [confirmedPassword, password]);


    const handleSignup = useCallback(
        async () => {
            setIsLoading(true);
            const result = await createUser({ username, password, email, full_name: fullName });
            if (result) {
                const { data }: { data: any } = result;
                console.log(data);
                if (data) {
                    setDisabled(true);
                    console.log("successful signup");
                    toast.success("Signup successful");
                    setTimeout(() => {
                        router.replace("/login");
                    }, 2000);
                } else {
                    console.log("error");
                    toast.error("Error signing up");
                }
            } else {
                console.log("error");
            }
            setIsLoading(false);
        },
        [router, username, password, email, fullName]
    );

    return (
        <>
            <Toaster />
            <Card className="py-4 w-[400px] h-auto border border-coolGray-700">
                <CardHeader className="justify-between pb-0 pt-2 px-4 flex-col">
                    <div className="font-bold text-xl">Signup ✌️</div>
                </CardHeader>
                <CardBody className="flex w-full flex-wrap flex-col md:mb-0 gap-4 py-8 px-8">
                    <Input
                        key="username"
                        variant='bordered'
                        type='text'
                        label='Username'
                        value={username}
                        onValueChange={setUsername}
                    />
                    <Input
                        key="fullname"
                        variant='bordered'
                        type='text'
                        label='Full Name'
                        value={fullName}
                        onValueChange={setFullName}
                    />
                    <Input
                        key="email"
                        variant='bordered'
                        label='Email'
                        type='email'
                        isInvalid={isInvalidEmail}
                        color={isInvalidEmail ? "danger" : "default"}
                        errorMessage="Please enter a valid email"
                        value={email}
                        onValueChange={setEmail}
                    />
                    <Input
                        key="password"
                        variant='bordered'
                        label='Password'
                        type='password'
                        value={password}
                        onValueChange={setPassword}
                    />
                    <Input
                        key="confirmed password"
                        variant='bordered'
                        label='Confirm password'
                        type='password'
                        value={confirmedPassword}
                        isInvalid={isInvalidConfirmedPassword}
                        color={isInvalidConfirmedPassword ? "danger" : "default"}
                        errorMessage="Password does not match"
                        onValueChange={setConfirmedPassword}
                    />
                    <Button
                        onPress={handleSignup}
                        isLoading={isLoading}
                        color="primary"
                        type='submit'
                        className="gradient-button"
                        isDisabled={isInvalidEmail || isInvalidConfirmedPassword || isEmpty(email) || isEmpty(password) || isEmpty(confirmedPassword) || isEmpty(username) || isEmpty(fullName) || isLoading || disabled}
                    >
                        Signup
                    </Button>
                </CardBody>
            </Card>
        </>
    );
}
