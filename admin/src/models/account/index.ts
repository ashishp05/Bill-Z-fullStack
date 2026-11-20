export interface ILoginRequestModel {
    email: string;
    password: string;
}

export interface IAddAdminRequestModel {
    name: string;
    email: string;
    password: string;
}

export interface IAdminProfileModel {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface IAddAdminResponseModel {
    admin: IAdminProfileModel;
}

export interface ILoginResponseModel {
    accessToken?: string;
    token?: string;
    refreshToken?: string;
    admin?: IAdminProfileModel;
    user?: {
        _id?: string;
        id?: string;
        name?: string;
        email?: string;
        phone?: string;
        role?: string;
        isActive?: boolean;
        firstName?: string;
        lastName?: string;
    };
}

export interface IChangePasswordModel {
    oldPassword: string;
    password: string;
    confirmPassword: string;
}

export interface IForgotPasswordEmailModel {
    email: string;
}

export interface IForgotPasswordOTPModel {
    otp: string;
}

export interface IForgotPasswordPasswordModel {
    password: string;
    confirmPassword: string;
}

export interface IRefreshTokenResponseModel {
    accessToken: string;
}