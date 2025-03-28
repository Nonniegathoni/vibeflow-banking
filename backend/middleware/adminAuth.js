import jwt from "jsonwebtoken"

const adminAuth = (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "")
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (decoded.role !== "admin") {
            throw new Error()
        }
        req.admin = decoded
        next()
    } catch (error) {
        res.status(401).json({ message: "Admin authentication failed" })
    }
}

export default adminAuth

