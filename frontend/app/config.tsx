
interface ENV {
    API_SERVER: string | undefined;
    MODEL_SERVER: string | undefined;
    CLOUDINARY_CLOUD_NAME: string | undefined;
    CLOUDINARY_API_KEY: string | undefined;
    CLOUDINARY_API_SECRET: string | undefined;

}

interface Config {
    API_SERVER: string | undefined;
    MODEL_SERVER: string | undefined
    CLOUDINARY_CLOUD_NAME: string | undefined;
    CLOUDINARY_API_KEY: string | undefined;
    CLOUDINARY_API_SECRET: string | undefined;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
    return {
        API_SERVER: process.env["NEXT_PUBLIC_API_SERVER"],
        MODEL_SERVER: process.env["NEXT_PUBLIC_MODEL_SERVER"],
        CLOUDINARY_CLOUD_NAME: process.env["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"],
        CLOUDINARY_API_KEY: process.env["NEXT_PUBLIC_CLOUDINARY_API_KEY"],
        CLOUDINARY_API_SECRET: process.env["CLOUDINARY_API_SECRET"],

    };
};

// Throwing an Error if any field was undefined we don't 
// want our app to run if it can't connect to DB and ensure 
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type 
// definition.

const getSanitzedConfig = (config: ENV): Config => {
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            throw new Error(`Missing key ${key} in .env`);
        }
    }
    return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;
