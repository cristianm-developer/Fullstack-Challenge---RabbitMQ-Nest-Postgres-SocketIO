import z from "zod";

export const authSubSchema = z.object({
    userId: z.number(),
    username: z.string(),
    email: z.string().email(),
})

export type AuthSubSchema = z.infer<typeof authSubSchema>;

export const authTokensSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.string(),
    sub: z.object({
        userId: z.number(),
        username: z.string(),
        email: z.string().email(),
    }).optional(),
})

export type AuthTokensSchema = z.infer<typeof authTokensSchema>;

export const loginSchema = z.object({
    usernameOrEmail: z.string().min(3),
    password: z.string().min(6),
})

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
})

export type RegisterSchema = z.infer<typeof registerSchema>;

export const userListedSchema = z.object({
    id: z.number(),
    username: z.string(),
});

export type UserListedSchema = z.infer<typeof userListedSchema>;