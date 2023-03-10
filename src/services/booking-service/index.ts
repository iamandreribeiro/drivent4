import { forbiddenError, notFoundError } from "@/errors";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import bookingRepository from "@/repositories/booking-repository";

async function getBooking(userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if(!enrollment) {
        throw notFoundError();
    }

    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
    if(!ticket || ticket.status === "RESERVED" || !ticket.TicketType.includesHotel || ticket.TicketType.isRemote) {
        throw forbiddenError();
    }

    const booking = await bookingRepository.findBookings(userId);
    if(!booking) {
        throw notFoundError();
    }

    const userBooking = {
        "bookingId": booking.id,
        "Room": booking.Room
    }

    return userBooking;
}

async function postBooking(userId:number, roomId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if(!enrollment) {
        throw notFoundError();
    }

    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
    if(!ticket || ticket.status === "RESERVED" || !ticket.TicketType.includesHotel || ticket.TicketType.isRemote) {
        throw forbiddenError();
    }

    const room = await bookingRepository.findHotelRooms(roomId);
    if(!room) {
        throw notFoundError();
    }

    const roomBookings = await bookingRepository.findRoomBookings(roomId);
    if(roomBookings.length === room.capacity) {
        throw forbiddenError();
    }

    const userBookings = await bookingRepository.findBookings(userId);
    if(userBookings) {
        throw forbiddenError();
    }

    const createBooking = await bookingRepository.createBooking(userId, roomId);
    const bookingId = {
        "bookingId": createBooking.id
    }

    return bookingId;
}

async function putBooking(userId: number, bookingId: number, roomId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if(!enrollment) {
        throw notFoundError();
    }

    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
    if(!ticket || ticket.status === "RESERVED" || !ticket.TicketType.includesHotel || ticket.TicketType.isRemote) {
        throw forbiddenError();
    }

    const room = await bookingRepository.findHotelRooms(roomId);
    if(!room) {
        throw notFoundError();
    }

    const roomBookings = await bookingRepository.findRoomBookings(roomId);
    if(roomBookings.length === room.capacity) {
        throw forbiddenError();
    }

    const userBookings = await bookingRepository.findBookings(userId);
    if(!userBookings) {
        throw forbiddenError();
    }

    const updateBooking = await bookingRepository.updateBooking(roomId, bookingId);
    const updatedBookingId = {
        "bookingId": updateBooking.id
    }

    return updatedBookingId;
}

const bookingService = {
    getBooking,
    postBooking,
    putBooking
}

export default bookingService;