/* eslint-disable import/no-anonymous-default-export */
import type { AxiosResponse } from "axios";
import type { IVendorModal, IVendorListResponse } from "../models/vendor";
import { buildQueryParams } from "../utils/commonFunctions";
import type { ApiResponseModel } from "./api";
import httpService from "./http-service";

const endPointBaseURL = `admin/vendors`;

const getAllVendors = async (
  params: Record<string, any>
): Promise<AxiosResponse<ApiResponseModel<IVendorListResponse>>> =>
  httpService.get<ApiResponseModel<IVendorListResponse>>(
    `${endPointBaseURL}${buildQueryParams(params)}`
  );

const getVendorById = async (
  vendorId: string
): Promise<AxiosResponse<ApiResponseModel<IVendorModal>>> =>
  httpService.get<ApiResponseModel<IVendorModal>>(
    `${endPointBaseURL}/${vendorId}`
  );

const toggleVendorStatus = async (
  vendorId: string,
  payload: { active: boolean }
): Promise<AxiosResponse<ApiResponseModel<IVendorModal>>> =>
  httpService.patch<ApiResponseModel<IVendorModal>>(
    `${endPointBaseURL}/${vendorId}/status`,
    payload
  );

export default {
  getAllVendors,
  getVendorById,
  toggleVendorStatus,
};
