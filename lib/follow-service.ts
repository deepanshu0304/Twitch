import { db } from "@/lib/db";
import { getSelf } from "./auth-service";



export const getFollowedUsers = async () => {
    try {

        const self = await getSelf();

        const followedusers =  await db.follow.findMany({
            where: {
                followerId: self.id,
                following: {
                    blocking: {
                        none: {
                            blockedId: self.id,
                        },
                    },
                },
            },
            include: {
                following: {
                    include: {
                        stream: {
                            select: {
                                isLive:true,
                            }
                        },
                    },
                },
            },
        });

        return followedusers;
        
    } catch {
        return [];
    }
}


export const isFollowingUser = async (id: string) => {
    try {
        const self = await getSelf()

        const otherUser = await db.user.findUnique({
            where: {
                id,
            }
        });

        if (!otherUser) {
            throw new Error( "User not found" )
        }

        if (otherUser.id == self.id) {
            return true;
        }


        const existingFollow = await db.follow.findFirst({
            where: {
                followerId: self.id,
                followingId: otherUser.id,
            }
        });

        return !!existingFollow

        
    } catch {
        return false;
        
    }
}


export const followUser = async (id: string) => {
    const self = await getSelf();
    const otherUser = await db.user.findUnique({
        where: { id }
    });
    if (!otherUser) {
        throw new Error("User not found");
    }
    if (otherUser.id === self.id) {
        throw new Error("Cannot follow yourself");
    }

    const existingFollow = await db.follow.findFirst({
        where: {
            followingId: otherUser.id,
            followerId: self.id,
        }

    });
    if (existingFollow) {
        throw new Error("Already following");
    }

    const follow = await db.follow.create({
        data: {
            followingId: otherUser.id,
            followerId: self.id,
        },
        include: {
            follower: true,
            following: true,
        }
    });

    return follow;
}


export const unFollowUser = async (id:string) => {
    const otherUser = await db.user.findUnique({
        where: {
            id,
        }
    });

    if (!otherUser) {
        throw new Error("User not found");
    }
    const self = await getSelf();
    if (otherUser.id === self.id) {
        throw new Error("Cannot unfollow yourself");
    }

    const existingFollow = await db.follow.findFirst({
        where: {
            followerId: self.id,
            followingId: otherUser.id,
        }
    });

    if (!existingFollow) {
        throw new Error(" Not following ");
    }
    const follow = await db.follow.delete({
        where: {
            id: existingFollow.id,
        },
        include: {
            following: true,
        }
        
    });

    return follow;


}