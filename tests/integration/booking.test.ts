import app, { init } from "@/app";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
    createEnrollmentWithAddress,
    createHotel,
    createPayment,
    createRoomWithHotelId,
    createRoomWithNoCapacity,
    createTicket,
    createTicketType,
    createTicketTypeRemote,
    createTicketTypeWithHotel,
    createUser
}
    from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";
import faker from "@faker-js/faker";
import { createBooking } from "../factories/booking-factory";
import { number, object, string } from "joi";


beforeAll(async () => {
    await init();
    await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/booking");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it("should respond with status 403 when user ticket is remote ", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeRemote();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            //Hoteis no banco

            const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it("should respond with status 403 when user ticket is not paid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeRemote();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            //Hoteis no banco

            const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        })

        it("should respond with status 404 when user has no enrollment ", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const ticketType = await createTicketTypeRemote();

            const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it("should respond with status 404 when user has no booking", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const room = await createRoomWithHotelId(createdHotel.id);

            const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it("should respond with status 200 and user booking", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const room = await createRoomWithHotelId(createdHotel.id);
            const booking = await createBooking(user.id, room.id);

            const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual({
                bookingId: expect.any(Number),
                Room: expect.objectContaining({
                    capacity: expect.any(Number),
                    hotelId: expect.any(Number),
                    id: expect.any(Number),
                    name: expect.any(String)
                })
            })
        })
    })
});

describe("POST /booking", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.post("/booking");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it("should respond with status 400 no roomId is given", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await createEnrollmentWithAddress(user);

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    
            expect(response.status).toBe(httpStatus.BAD_REQUEST);
        });

        it("should respond with status 403 when user ticket is remote ", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeRemote();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            //Hoteis no banco

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({
                roomId: room.id
            });

            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it("should respond with status 403 when user ticket is not paid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeRemote();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            //Hoteis no banco

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({
                roomId: room.id
            });

            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        })

        it("should respond with status 404 when user has no enrollment ", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);

            const ticketType = await createTicketTypeRemote();

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({
                roomId: room.id
            });

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it("should respond with status 404 when given roomId does not exist", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({
                roomId: room.id+1
            });

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it("should respond with status code 403 when room has no vacancy", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithNoCapacity(hotel.id);

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({
                roomId: room.id
            });

            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it("should respond with status code 403 when user has already booked a room", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            await createBooking(user.id, room.id);

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({
                roomId: room.id
            });

            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it("should respond with status code 200 and bookingId", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({
                roomId: room.id
            });
            
            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual({
                bookingId: expect.any(Number)
            });
        });
    });
});

describe("PUT /booking:id", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.put("/booking/:id");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server.put("/booking/:id").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.put("/booking/:id").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it('Should respond with 400 when no booking id is given', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
    
            const response = await server.put(`/booking/:id`).set("Authorization", `Bearer ${token}`).send({
                roomId: room.id
            });

            expect(response.status).toBe(httpStatus.BAD_REQUEST);
        });

        it('Should respond with 400 when no room id is given', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const booking = await createBooking(user.id, room.id);

            const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.BAD_REQUEST);
        });
        
        it("should respond with status 403 when user ticket is remote ", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeRemote();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const booking = await createBooking(user.id, room.id);
            //Hoteis no banco

            const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({
                roomId: room.id
            });

            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it("should respond with status 403 when user ticket is not paid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const booking = await createBooking(user.id, room.id);
            //Hoteis no banco

            const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({
                roomId: room.id
            });

            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it("should respond with status 404 when user has no enrollment", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const booking = await createBooking(user.id, room.id);
            //Hoteis no banco

            const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({
                roomId: room.id
            });

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it("should respond with status 404 when given room id not exist", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const booking = await createBooking(user.id, room.id);

            const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({
                roomId: room.id+1
            });

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it("should respond with status 403 when room has no vacancy", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const room2 = await createRoomWithNoCapacity(hotel.id);
            const booking = await createBooking(user.id, room.id);

            const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({
                roomId: room2.id
            });

            expect(response.status).toBe(httpStatus.FORBIDDEN);
        });

        it("should respond with status 403 when user has no bookings", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);

            const response = await server.put(`/booking/1`).set("Authorization", `Bearer ${token}`).send({
                roomId: room.id
            });

            expect(response.status).toBe(httpStatus.FORBIDDEN);
        });

        it("should respond with status 200 and bookingId", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const room2 = await createRoomWithHotelId(hotel.id);
            const booking = await createBooking(user.id, room.id);

            const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({
                roomId: room2.id
            });

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual({
                bookingId: expect.any(Number)
            });
        });
    });
});