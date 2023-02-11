import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getBooking, postBooking, putBooking } from "@/controllers";

const bookingRouter = Router();

bookingRouter
    .all("/*", authenticateToken)
    .post("/", postBooking)
    .get("/", getBooking)
    .put("/:bookingId", putBooking);

export { bookingRouter };