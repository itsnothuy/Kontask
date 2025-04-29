'use client';

import { Input, Card, CardHeader, CardBody, Image, Avatar, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Chip } from "@heroui/react";
import { LinkIcon, NameIcon, EmailIcon, PhoneIcon, EditIcon, EyeIcon, AddIcon, TrashIcon } from "@/components/icons/page";
import { CldUploadWidget, CldOgImage, CldImage } from 'next-cloudinary';
import { useState, useCallback, useEffect, useMemo, use } from "react";
import { getProfile, createResume, getResume } from "@/services/profile";
import toast, { Toaster } from 'react-hot-toast';

import Link from "next/link";
import { updateUser } from "@/services/auth";

type ProfileProps = {
    profile_name: string | undefined;
    full_name: string | undefined;
    job_title: string | undefined;
    email: string | undefined;
    phone: string | undefined;
    avatar_url: string | undefined;
    linkedIn: string | undefined;
} | undefined;

type ResumeProps = {
    resume_public_id: string | undefined;
    resume_title: string | undefined;
    resume_pdf_url: string | undefined;
} | undefined;

const initialSkills = ["C++", "React", "NextJS", "mongoDB"];

export default function Profile() {
    const editModal = useDisclosure();
    const previewModal = useDisclosure();

    const [editTitle, setEditTitle] = useState("");

    const [skills, setSkills] = useState(initialSkills);

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [job_title, setJobTitle] = useState("");
    const [profileName, setProfileName] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    const handleClose = (skillToRemove: string) => {
        setSkills(skills.filter((skill: string) => skill !== skillToRemove));
        if (skills.length === 1) {
            setSkills(initialSkills);
        }
    };
    const [profileInfo, setProfileInfo] = useState<ProfileProps>(
        // {
        //     profile_name: "Dat Vuong",
        //     full_name: "Dat Trong Vuong",
        //     job_title: "Software Engineer",
        //     email: "trongdatvuong@gmail.com",
        //     phone: "765-712-2967",
        //     avatar_url: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        //     linkedIn: "https://www.linkedin.com/in/dat-vuong/",
        // }
    );

    const handleSave = useCallback((title: string) => {
        switch (title) {
            case "Contact":
                return async () => {
                    setIsSaving(true);

                    const result = await updateUser({
                        full_name: fullName,
                        phone: phone
                    });

                    const { data, ok }: { data: any, ok: boolean } = result;
                    if (ok) {
                        setProfileInfo({
                            profile_name: profileInfo?.profile_name,
                            full_name: fullName,
                            job_title: profileInfo?.job_title,
                            email: profileInfo?.email,
                            phone: phone,
                            avatar_url: profileInfo?.avatar_url,
                            linkedIn: profileInfo?.linkedIn
                        });
                        toast.success("Contact updated successfully");
                    }
                    else {
                        toast.error("Error updating contact");
                    }

                    setIsSaving(false);
                    editModal.onClose();
                }
            case "LinkedIn":
                return async () => {
                    setIsSaving(true);

                    const result = await updateUser({
                        linkedin_url: linkedin
                    });

                    const { data, ok }: { data: any, ok: boolean } = result;
                    if (ok) {
                        setProfileInfo({
                            profile_name: profileInfo?.profile_name,
                            full_name: profileInfo?.full_name,
                            job_title: profileInfo?.job_title,
                            email: profileInfo?.email,
                            phone: profileInfo?.phone,
                            avatar_url: profileInfo?.avatar_url,
                            linkedIn: linkedin
                        });
                        toast.success("LinkedIn updated successfully");
                    }
                    else {
                        toast.error("Error updating LinkedIn");
                    }

                    setIsSaving(false);
                    editModal.onClose();
                }
            default:
                return () => { }

        }
    }, [fullName, phone, linkedin]);

    const [resumeInfo, setResumeInfo] = useState<ResumeProps>();

    const renderEditModal = useCallback((title: string) => {
        switch (title) {
            case "Contact":
                return (
                    <Modal isOpen={editModal.isOpen} onOpenChange={editModal.onOpenChange} className="dark" size="5xl" scrollBehavior="inside">
                        <ModalContent>
                            {() => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">
                                        {title}
                                    </ModalHeader>
                                    <ModalBody className="flex flex-col">
                                        <Input variant="underlined" label="Full Name" value={fullName} onValueChange={setFullName} />
                                        <Input defaultValue={profileInfo?.email} variant="underlined" label="Email" disabled={true} />
                                        <Input variant="underlined" label="Phone" value={phone} onValueChange={setPhone} />
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="primary" onClick={handleSave(title)} isLoading={isSaving} >
                                            Save
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                )
            case "Resume":
                return (
                    <Modal isOpen={editModal.isOpen} onOpenChange={editModal.onOpenChange} className="dark" size="5xl" scrollBehavior="inside">
                        <ModalContent>
                            {() => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">
                                        {title}
                                    </ModalHeader>
                                    <ModalBody className="flex flex-col">
                                        <div className="flex flex-row gap-4 justify-left items-center">
                                            <Button color="primary" onPress={previewModal.onOpenChange}>
                                                <EyeIcon height={20} width={20} /> Preview
                                            </Button>
                                            <p key="fullName" className="text-md">{resumeInfo?.resume_title}</p>
                                            <Button isIconOnly color="danger" variant="light">
                                                <TrashIcon height={20} width={20} color="#EB0000" />
                                            </Button>
                                        </div>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="primary">
                                            Save
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                )
            case "LinkedIn":
                return (
                    <Modal isOpen={editModal.isOpen} onOpenChange={editModal.onOpenChange} className="dark" size="5xl" scrollBehavior="inside">
                        <ModalContent>
                            {() => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">
                                        {title}
                                    </ModalHeader>
                                    <ModalBody className="flex flex-col">
                                        <Input defaultValue={profileInfo?.linkedIn} value={linkedin} onValueChange={setLinkedin} variant="underlined" />
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="primary" onClick={handleSave(title)} isLoading={isSaving} >
                                            Save
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                )
            default:
                return null;
        }
    }, [editModal.isOpen, editModal.onOpenChange, linkedin, phone, fullName]);

    const queryProfile = async () => {
        const profileData = await getProfile();

        if (profileData) {
            const { data, ok }: { data: any, ok: boolean } = profileData;
            if (ok === true) {
                const newProfileInfo = {
                    profile_name: data.user.username,
                    full_name: data.user.full_name,
                    job_title: data.user.job_title,
                    email: data.user.email,
                    phone: data.user.phone,
                    avatar_url: data.user.avatar_url,
                    linkedIn: data.user.linkedin_url,
                }
                setProfileInfo(newProfileInfo);
                setFullName(newProfileInfo.full_name);
                setPhone(newProfileInfo.phone);
                setLinkedin(newProfileInfo.linkedIn);
            }
        }

        const resumeData = await getResume();

        if (resumeData) {
            const { data, ok }: { data: any, ok: boolean } = resumeData;
            if (ok === true) {
                const newResumeInfo = {
                    resume_public_id: data.resume.resume_public_id,
                    resume_title: data.resume.resume_title,
                    resume_pdf_url: data.resume.resume_pdf_url
                }
                setResumeInfo(newResumeInfo);
            }
        }
    };

    const handleEdit = useCallback((title: string) => {
        setEditTitle(title);
        editModal.onOpen();

    }, [editTitle]);

    useEffect(() => {
        queryProfile();
    }, []);

    return (
        <div className="h-full dark flex-row flex gap-4 justify-center px-8">
            <Toaster />
            <div className="w-1/4 flex flex-col gap-4">
                <Card className=" px-8 py-16 flex-col justify-center items-center bg-gradient-to-r from-violet-500 to-indigo-500">
                    <CardHeader className="px-0 justify-end">
                        <Button isIconOnly aria-label="Edit" variant="light">
                            <EditIcon height={20} width={20} />
                        </Button>
                    </CardHeader>
                    <div className="pb-4">
                        <Avatar
                            className="w-30 h-30"
                            name="Jason Hughes"
                            src={profileInfo?.avatar_url}
                        />
                    </div>
                    <p className="font-bold text-xl">{profileInfo?.profile_name}</p>
                    <p className="text-sm">{profileInfo?.job_title}</p>
                </Card>
                <Card className=" px-8 py-8 flex-col justify-center dark">
                    <CardHeader className="px-0 flex-row justify-between">
                        <p className="font-bold text-xl">Contact</p>
                        <Button isIconOnly aria-label="Edit" variant="light" onClick={() => handleEdit("Contact")}>
                            <EditIcon height={20} width={20} />
                        </Button>
                    </CardHeader>
                    <Divider />
                    <CardBody className="px-0 flex-col items-start">
                        <div className="flex flex-row gap-4 justify-center items-center">
                            <NameIcon height={20} width={20} />
                            <p key="fullName" className="text-md">{profileInfo?.full_name}</p>
                        </div>
                        <div className="flex flex-row gap-4 justify-center items-center">
                            <EmailIcon height={20} width={20} />
                            <p key="fullName" className="text-md">{profileInfo?.email}</p>
                        </div>
                        <div className="flex flex-row gap-4 justify-center items-center">
                            {profileInfo?.phone !== undefined ?
                                <>
                                    <PhoneIcon height={20} width={20} />
                                    <p key="fullName" className="text-md">{profileInfo.phone}</p>
                                </> : null
                            }
                        </div>
                    </CardBody>
                </Card>
            </div>
            <div className="w-1/2 flex flex-col gap-4">
                <Card className=" px-8 py-8 flex-col justify-center dark">
                    <CardHeader className="px-0 flex-row justify-between">
                        <p className="font-bold text-xl">Resume</p>
                        <Button isIconOnly aria-label="Edit" variant="light" onClick={() => handleEdit('Resume')}>
                            <EditIcon height={20} width={20} />
                        </Button>
                    </CardHeader>
                    <Divider />
                    <CldOgImage src={resumeInfo?.resume_public_id ?? ""} alt="Resume" />
                    <CardBody className="px-0 flex-col items-start">
                        {resumeInfo?.resume_public_id !== undefined ?
                            <div className="flex flex-row gap-4 justify-center items-center">
                                <Button color="primary" onPress={previewModal.onOpenChange}>
                                    <EyeIcon height={20} width={20} /> Preview
                                </Button>
                                <p key="fullName" className="text-md">{resumeInfo.resume_title}</p>
                                <Modal scrollBehavior="inside" size="5xl" backdrop="blur" isOpen={previewModal.isOpen} onClose={previewModal.onClose} className="dark">
                                    <ModalContent>
                                        {(onClose) => (
                                            <>
                                                <ModalHeader className="flex flex-col gap-1">{[resumeInfo.resume_title]}</ModalHeader>
                                                <ModalBody>
                                                    <CldImage width="960" height="600" src={resumeInfo.resume_public_id ?? ""} alt="Resume" />
                                                </ModalBody>
                                                <ModalFooter>
                                                    <Button color="danger" variant="light" onPress={onClose}>
                                                        Close
                                                    </Button>
                                                </ModalFooter>
                                            </>
                                        )}
                                    </ModalContent>
                                </Modal>
                            </div>
                            :
                            <CldUploadWidget signatureEndpoint="/api/upload"
                                onSuccess={(results) => {
                                    if (typeof results.info === 'object') {
                                        setResumeInfo({
                                            resume_public_id: results.info.public_id,
                                            resume_title: results.info.original_filename,
                                            resume_pdf_url: results.info.url
                                        })

                                        const createResumeInput = {
                                            resume_public_id: results.info.public_id,
                                            resume_title: results.info.original_filename,
                                            resume_pdf_url: results.info.url
                                        }
                                        createResume(createResumeInput);
                                    }
                                }}
                            >
                                {({ open }) => {
                                    return (
                                        <Button onClick={() => open()}>
                                            <AddIcon height={20} width={20} />
                                            Upload Resume
                                        </Button>
                                    );
                                }
                                }
                            </CldUploadWidget>}
                    </CardBody>
                </Card>
                <Card className=" px-8 py-8 flex-col justify-center dark">
                    <CardHeader className="px-0 flex-row justify-between">
                        <p className="font-bold text-xl">LinkedIn</p>
                        <Button isIconOnly aria-label="Edit" variant="light" onClick={() => handleEdit('LinkedIn')}>
                            <EditIcon height={20} width={20} />
                        </Button>
                    </CardHeader>
                    <Divider />
                    <CardBody className="px-0 flex-col items-start ">
                        <div className="flex flex-row gap-4 justify-center items-center">
                            {
                                profileInfo?.linkedIn === undefined ?
                                    <Button onPress={() => handleEdit('LinkedIn')}>
                                        <AddIcon height={20} width={20} /> Add LinkedIn
                                    </Button>
                                    :
                                    <>
                                        <LinkIcon height={20} width={20} />
                                        <Link href={profileInfo?.linkedIn ?? ""}><p key="LinkedIn" className="text-md">{profileInfo?.linkedIn}</p></Link>
                                    </>
                            }
                        </div>
                    </CardBody>
                </Card>
                <Card className=" px-8 py-8 flex-col justify-center dark">
                    <CardHeader className="px-0 flex-row justify-between">
                        <p className="font-bold text-xl">Skills</p>
                        <Button isIconOnly aria-label="Edit" variant="light">
                            <EditIcon height={20} width={20} />
                        </Button>
                    </CardHeader>
                    <Divider />
                    <CardBody className="px-0 flex-col items-start ">
                        <div className="flex flex-row gap-2 justify-center items-center">
                            {skills.map((skill: string) => (
                                <Chip key={skill} onClose={() => handleClose(skill)}>{skill}</Chip>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>
            {renderEditModal(editTitle)}
        </div >
    );
}