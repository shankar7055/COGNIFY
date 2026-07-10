import crypto from 'crypto';

export const generateApiKey = () => {
    return "cg_" + crypto.randomBytes(32).toString("hex");
};

export const hashApiKey = (key: string) => {
    return crypto
        .createHash("sha256")
        .update(key)
        .digest("hex");
};