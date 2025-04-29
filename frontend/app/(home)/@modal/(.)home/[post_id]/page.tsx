'use client';

import PostDetailsPage from "../../../home/[post_id]/page";

interface Params {
    post_id: string;
}
export default function PostDetailsModalPage({ params }: { params: Params }) {
    return (
        <PostDetailsPage params={params}>
        </PostDetailsPage>
    );
}