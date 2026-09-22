import type ConfigType from "@/config/types";

const config: ConfigType = {
    access_secret: process.env.JWT_ACCESS_SECRET || "rentnest_default_jwt_access_secret_key_2026",
    refresh_secret: process.env.JWT_REFRESH_SECRET || "rentnest_default_jwt_refresh_secret_key_2026",
}
export default config;