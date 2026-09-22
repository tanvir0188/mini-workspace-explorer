import type ConfigType from "@/config/types";

const config: ConfigType = {
    base_url: process.env.BACKEND_API_URL as string,
    access_secret: process.env.JWT_ACCESS_SECRET as string,
    refresh_secret: process.env.JWT_REFRESH_SECRET as string,
}
export default config;