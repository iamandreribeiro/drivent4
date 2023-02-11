import { prisma } from "@/config";

async function findBookings(userId: number) {
    return prisma.booking.findFirst({
        where: {
            userId
        },
        include: {
            Room: true
        }
    })
}

async function createBooking(userId:number, roomId: number) {
    return prisma.booking.create({
        data: {
            userId,
            roomId
        }
    })
}

async function updateBooking(roomId: number, bookingId: number) {
    return prisma.booking.update({
        where: {
            id: bookingId
        },
        data: {
            roomId: roomId
        }
    })
}

async function findHotelRooms(roomId: number) {
    return prisma.room.findFirst({
        where: {
            id: roomId
        }
    })
}

async function findRoomBookings(roomId: number) {
    return prisma.booking.findMany({
        where: {
            roomId
        }
    });
}

const bookingRepository = {
    findBookings,
    createBooking,
    updateBooking,
    findHotelRooms,
    findRoomBookings
}

export default bookingRepository;