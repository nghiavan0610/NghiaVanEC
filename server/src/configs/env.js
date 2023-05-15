require('dotenv').config();

const {
    NODE_ENV,
    NODE_DOCKER_PORT,

    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRE,
    REFRESH_TOKEN_EXPIRE,

    MONGODB_NAME,
    MONGODB_HOST,
    MONGODB_USER,
    MONGODB_PASSWORD,

    REDIS_HOST,

    S3_ACCESS_KEY,
    S3_SECRET_KEY,
    S3_HOSTNAME,
    S3_BUCKET,
} = process.env;

const config = {
    NODE_ENV,
    NODE_DOCKER_PORT,

    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRE,
    REFRESH_TOKEN_EXPIRE,

    MONGODB_NAME,
    MONGODB_HOST,
    MONGODB_USER,
    MONGODB_PASSWORD,

    REDIS_HOST,

    S3_ACCESS_KEY,
    S3_SECRET_KEY,
    S3_HOSTNAME,
    S3_BUCKET,

    // MONGODB_URI: `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}/${MONGODB_NAME}?authSource=admin`,
};

module.exports = config;
