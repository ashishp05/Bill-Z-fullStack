import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ResponseMessages } from '../../../constants/messages';
import { sendJsonResponse } from '../../../utils/response.util';
import { InvoiceService } from '../services/invoice.service';
import { CreateInvoiceInput, InvoiceQueryInput, UpdatePaymentInput } from '../types/invoice.types';

export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  // Vendor

  getAll = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as InvoiceQueryInput;
    const result = await this.invoiceService.list({ vendorId: req.userId as string }, query);
    sendJsonResponse(res, result, ResponseMessages.FETCHED, StatusCodes.OK);
  };

  getSummary = async (req: Request, res: Response): Promise<void> => {
    const summary = await this.invoiceService.getVendorSummary(req.userId as string);
    sendJsonResponse(res, summary, ResponseMessages.FETCHED, StatusCodes.OK);
  };

  getById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const invoice = await this.invoiceService.getForVendor(req.userId as string, req.params.id);
    sendJsonResponse(res, invoice, ResponseMessages.FETCHED, StatusCodes.OK);
  };

  create = async (req: Request<{}, {}, CreateInvoiceInput>, res: Response): Promise<void> => {
    const invoice = await this.invoiceService.create(req.userId as string, req.body);
    sendJsonResponse(res, invoice, ResponseMessages.INVOICE_CREATED, StatusCodes.CREATED);
  };

  updatePayment = async (
    req: Request<{ id: string }, {}, UpdatePaymentInput>,
    res: Response,
  ): Promise<void> => {
    const invoice = await this.invoiceService.updatePayment(
      req.userId as string,
      req.params.id,
      req.body,
    );
    sendJsonResponse(res, invoice, ResponseMessages.PAYMENT_STATUS_UPDATED, StatusCodes.OK);
  };

  // Customer (read-only)

  getAllForCustomer = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as InvoiceQueryInput;
    const result = await this.invoiceService.list({ customerId: req.userId as string }, query);
    sendJsonResponse(res, result, ResponseMessages.FETCHED, StatusCodes.OK);
  };

  getByIdForCustomer = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const invoice = await this.invoiceService.getForCustomer(req.userId as string, req.params.id);
    sendJsonResponse(res, invoice, ResponseMessages.FETCHED, StatusCodes.OK);
  };
}
