export type LoginUserInput = {
    username: string;
    password: string;
}

export type CreateUserInput = {
    email: string;
    password: string;
    full_name: string;
    username: string;
}

export type CreateResumeInput = {
    resume_public_id: string;
    resume_title: string;
    resume_pdf_url: string;
}

export type GenerateEmailInput = {
    linkedin_url: string;
    job_description: string;
}

export type CreateEmailInput = {
    subject: string;
    content: string;
    title: string;
    email_address: string;
}

export type GetEmailsInput = {
    page: number;
    limit: number;
}

export type UpdateUserInput = {
    full_name?: string;
    username?: string;
    phone?: string;
    job_title?: string;
    avatar_url?: string;
    linkedin_url?: string;
}

export type UpdateEmailInput = {
    title?: string;
    subject?: string;
    content?: string;
}

export type CreatePostInput = {
    content: string;
}