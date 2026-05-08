import { getAuth } from "@clerk/express";
import { Router } from "express";
import { getLocalUser } from "../lib/users";

const router = Router();

router.get('/', async(req, res, next) => {
    try {
        const { userId, isAuthenticated } = getAuth(req);
        if (!isAuthenticated || !userId) {
            res.status(401).json({ message: "You are authorized" });
            return;
        }
        const user = await getLocalUser(userId);
        res.json({ user });
    } catch (error) {
        next(error);
    }
})

export default router;

/* What is happening here ?
Clerk checks weather the user is authenticated or not via getAuth() {from clrek's auth table}
if user is then we get the user ID from the clerk to getLocalUser which brings in the other details 
of the user from our db using user's ID verified by clerk.
 */