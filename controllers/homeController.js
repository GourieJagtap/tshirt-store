const BigPromise= require('../middlewares/bigPromise')

exports.home= BigPromise((req,res) => {
    res.status(200).json({
        success:true,
        greeting:"Hello from tshirt store"
    });

})
exports.dummy= (req,res) => {
    res.status(200).json({
        success:true,
        greeting:"this is a dummy route"
    });

}
