"use client";


import { onBlock } from "@/actions/block";
import { onFollow, onUnFollow } from "@/actions/follow";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";


interface ActionProps {
    isFollowing: boolean,
    userId: string
}

export const Actions = ({ isFollowing, userId }: ActionProps) => {
    const [isPending, startTransition] = useTransition();
    const handleFollow = () => {
        startTransition(() => {

            onFollow(userId)
                .then((data) => toast.success(`You are now following ${data.following.username}`))
                .catch(() => toast.error('Something went wrong'));
        });
    };
    const handleUnfollow = () => {
        startTransition(() => {

            onUnFollow(userId)
                .then((data) => toast.success(`You have unfollowed ${data.following.username}`))
                .catch(() => toast.error('Something went wrong'));
        });
    };

    const onClick = () => {
        if (isFollowing) {
            handleUnfollow();
        }
        else {
            handleFollow();
        }
    }

    const handleBlock = () => {
        startTransition(() => {
            onBlock(userId)
                .then((data) => toast.success(`Blocked the user ${data?.blocked.username}`))
                .catch((e) => toast.error(`Something went wrong ${e}`))
        });
    }

    return (
        <>
            <Button disabled={isPending} onClick={onClick} variant="primary">
                {isFollowing ? "Unfollow" : "Follow"}
            </Button>

            <Button disabled={isPending} onClick={handleBlock} >
                Block
            </Button>

        </>
    );
}