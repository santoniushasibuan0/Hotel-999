export type RoomStatus='AVAILABLE'|'RESERVED'|'OCCUPIED'|'CLEANING'|'MAINTENANCE';
export type ReservationStatus='PENDING'|'CONFIRMED'|'CHECKED_IN'|'CHECKED_OUT'|'CANCELLED';
export type Room={id:string;number:string;type:string;rate:number;status:RoomStatus};
export type Guest={id:string;name:string;phone:string;email:string};
export type Reservation={id:string;guestId:string;roomId:string;checkIn:string;checkOut:string;status:ReservationStatus;total:number};
export type Product={id:string;name:string;category:string;stock:number;minimumStock:number;unit:string};
export type InventoryTransaction={id:string;productId:string;type:'IN'|'OUT';quantity:number;date:string};
