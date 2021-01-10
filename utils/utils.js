class Utils {
    static requireRole(groupid) {
        return (req, res, next) => {
            // if (this.authenticate(req, res, next)) {
            if (req.authenticated) {
                switch (groupid) {
                    case 1:
                        if (req.user.groupid === groupid) {
                            return next();
                        }
                        break;
                    case 2:
                        if (req.user.groupid === groupid) {
                            return next();
                        }
                        break;
                    case 3:
                        if (req.user.groupid === groupid) {
                            return next();
                        }
                        break;
                    default:
                        return res.status(403).send("403 Forbidden");
                }
                return res.status(403).send("403 Forbidden");
            }
            return res.status(403).send("403 Forbidden");
        };
    }
}
module.exports = Utils;