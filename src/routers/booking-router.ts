import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getBooking, postBooking, putBooking } from "@/controllers";

const bookingRouter = Router();

bookingRouter
    .all("/*", authenticateToken)
    .post("/booking", postBooking)
    .get("/booking", getBooking)
    .put("/booking/:id", putBooking);

export { bookingRouter };