import { SetMetadata } from "@nestjs/common";

export const PUBLIC_PERMISSION_KEY = "public_permission";
export const PublicPermission = () => SetMetadata(PUBLIC_PERMISSION_KEY, true);
