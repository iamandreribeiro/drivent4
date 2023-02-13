import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import bookingService from "@/services/booking-service";

export async function postBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;

    const { roomId } = req.body;

    if(!roomId) {
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    try {
        const booking = await bookingService.postBooking(userId, roomId);

        return res.status(httpStatus.OK).send(booking);
    } catch (error) {
        if(error.name === "Forbidden") {
            return res.sendStatus(httpStatus.FORBIDDEN);
        }

        if(error.name === "NotFoundError") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }

        return res.sendStatus(httpStatus.BAD_REQUEST);
    }
}

export async function getBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;

    try {
        const booking = await bookingService.getBooking(userId);

        res.status(200).send(booking);
    } catch (error) {
        if(error.name === "Forbidden") {
            return res.sendStatus(httpStatus.FORBIDDEN);
        }

        if(error.name === "NotFoundError") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { bookingId } = req.params;
    const { roomId } = req.body;

    if(!roomId) {
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    if (isNaN(Number(bookingId)) || !bookingId) {
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    try {
        const booking = await bookingService.putBooking(userId, Number(bookingId), roomId);

        return res.status(200).send(booking);
    } catch (error) {
        if(error.name === "Forbidden") {
            return res.sendStatus(httpStatus.FORBIDDEN);
        }

        if(error.name === "NotFoundError") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        
        console.log(error);
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }
}