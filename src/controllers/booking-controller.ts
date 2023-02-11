import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";

export async function postBooking(req: AuthenticatedRequest, res: Response) {
    try {
    } catch (error) {
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }
}

export async function getBooking(req: AuthenticatedRequest, res: Response) {
    try {
    } catch (error) {
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
    try {
    } catch (error) {
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }
}