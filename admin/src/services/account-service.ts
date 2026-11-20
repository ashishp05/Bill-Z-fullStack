/* eslint-disable import/no-anonymous-default-export */
import type { AxiosResponse } from "axios";
import type {
    IAddAdminRequestModel,
    IAddAdminResponseModel,
    IAdminProfileModel,
    IChangePasswordModel,
    IForgotPasswordEmailModel,
    IForgotPasswordOTPModel,
    IForgotPasswordPasswordModel,
    ILoginRequestModel,
    ILoginResponseModel,
} from "../models/account";
import type { ApiResponseModel } from "./api";
import httpService from "./http-service";

const endPointBaseURL = `admin`;

const login = async (requestBody: ILoginRequestModel): Promise<AxiosResponse<ApiResponseModel<ILoginResponseModel>>> =>
    httpService.post<ApiResponseModel<ILoginResponseModel>>(`${endPointBaseURL}/login`, requestBody);

const addAdmin = async (requestBody: IAddAdminRequestModel): Promise<AxiosResponse<ApiResponseModel<IAddAdminResponseModel>>> =>
    httpService.post<ApiResponseModel<IAddAdminResponseModel>>(`${endPointBaseURL}/add`, requestBody);

const getProfile = async (): Promise<AxiosResponse<ApiResponseModel<IAdminProfileModel>>> =>
    httpService.get<ApiResponseModel<IAdminProfileModel>>(`${endPointBaseURL}/profile`);

const changePassword = async (requestBody: IChangePasswordModel | { oldPassword: string; newPassword: string }): Promise<AxiosResponse<ApiResponseModel<boolean>>> =>
    httpService.post<ApiResponseModel<boolean>>(`${endPointBaseURL}/change-password`, requestBody);

const logout = async (): Promise<AxiosResponse<ApiResponseModel<boolean>>> =>
    httpService.post<ApiResponseModel<boolean>>(`${endPointBaseURL}/logout`, {});

const forgotPassword = async (requestBody: IForgotPasswordEmailModel): Promise<AxiosResponse<ApiResponseModel<ILoginResponseModel>>> =>
    httpService.post<ApiResponseModel<ILoginResponseModel>>(`forgot_password/`, requestBody);

const varifyOTP = async (requestBody: IForgotPasswordOTPModel): Promise<AxiosResponse<ApiResponseModel<ILoginResponseModel>>> =>
    httpService.post<ApiResponseModel<ILoginResponseModel>>(`verify_otp/`, requestBody);

const resendOTP = async (): Promise<AxiosResponse<ApiResponseModel<ILoginResponseModel>>> =>
    httpService.get<ApiResponseModel<ILoginResponseModel>>(`resend_otp/`);

const resetPassword = async (requestBody: IForgotPasswordPasswordModel): Promise<AxiosResponse<ApiResponseModel<ILoginResponseModel>>> =>
    httpService.post<ApiResponseModel<ILoginResponseModel>>(`${endPointBaseURL}/resetPassword`, requestBody);

export default {
    login,
    addAdmin,
    getProfile,
    changePassword,
    logout,
    forgotPassword,
    varifyOTP,
    resendOTP,
    resetPassword,
};
