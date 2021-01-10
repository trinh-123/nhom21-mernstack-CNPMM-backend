module.exports.getProfile = async (req,res)=>{
    return res.status(200).json(req.user)
}