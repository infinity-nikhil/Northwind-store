import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";


export async function getLocalUser(clerkUserId: string) {
    const [row] = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1);
    return row;
}

//This helper fxn acts as a bridge btwn clerk auth and our DB 
/* And what it does ?
Looks for a row where clerkUserId column matches the ID passed in
The [row] destructuring pulls the first element out of the results array — 
so row is either a single user object or undefined if not found

The verification part is already done by clerk it's just fetching the user details
from the db using the userId. 

Tabhi to koi if check nahi lagaya hai ...neither here nor where this fxn is being called
cause we know that clerk ne verify kara hai to user hoga-hi-hoga. 
*/