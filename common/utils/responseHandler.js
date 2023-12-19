
exports.Response = (res, code, message) => {
    return res.status(code).json({
        error: message
    })
}
